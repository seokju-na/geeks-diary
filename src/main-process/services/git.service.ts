import * as nodeGit from 'nodegit';
import { CloneOptions, Commit, DiffFile, Oid, Repository, Revwalk, StatusFile } from 'nodegit';
import * as path from 'path';
import {
    GitAuthenticationFailError,
    GitCloneOptions,
    GitCommitOptions,
    GitError,
    GitErrorCodes,
    gitErrorRegexes,
    GitGetHistoryOptions,
    GitGetHistoryResult,
} from '../../core/git';
import { VcsAuthenticationTypes, VcsCommitItem, VcsFileChange, VcsFileChangeStatusTypes } from '../../core/vcs';
import { datetime, DateUnits } from '../../libs/datetime';
import { IpcActionHandler } from '../../libs/ipc';
import { Service } from './service';


export class GitService extends Service {
    private git = nodeGit;

    constructor() {
        super('git');
    }

    init(): void {
    }

    async isRepositoryExists(dirPath: string): Promise<boolean> {
        try {
            const repository = await this.openRepository(dirPath);
            repository.free();

            return true;
        } catch (error) {
            return false;
        }
    }

    async openRepository(dirPath: string): Promise<Repository> {
        return this.git.Repository.open(dirPath);
    }

    @IpcActionHandler('createRepository')
    async createRepository(dirPath: string): Promise<void> {
        const repository = await this.git.Repository.init(dirPath, 0);

        repository.free();
    }

    @IpcActionHandler('cloneRepository')
    async cloneRepository(options: GitCloneOptions): Promise<void> {
        const cloneOptions = (): CloneOptions => {
            let tries = 0;

            const opts: CloneOptions = {
                fetchOpts: { callbacks: {} },
            };

            // github will fail cert check on some OSX machines
            // this overrides that check.
            opts.fetchOpts.callbacks.certificateCheck = () => 1;

            if (options.authentication) {
                opts.fetchOpts.callbacks.credentials = () => {
                    if (tries++ > 5) {
                        throw new Error('Authentication Error');
                    }

                    const type = options.authentication.type;

                    switch (type) {
                        case VcsAuthenticationTypes.BASIC:
                            return this.git.Cred.userpassPlaintextNew(
                                options.authentication.username,
                                options.authentication.password,
                            );

                        case VcsAuthenticationTypes.OAUTH2_TOKEN:
                            return this.git.Cred.userpassPlaintextNew(
                                options.authentication.token,
                                'x-oauth-basic',
                            );
                    }
                };
            }

            return opts;
        };

        const repository = await this.git.Clone.clone(
            options.url,
            options.localPath,
            cloneOptions(),
        );

        repository.free();
    }

    @IpcActionHandler('getFileChanges')
    async getFileChanges(dirPath: string): Promise<VcsFileChange[]> {
        const repository = await this.openRepository(dirPath);
        const statues = await repository.getStatusExt();
        const fileChanges = statues.map(status => this.parseFileChange(dirPath, status));

        repository.free();

        return fileChanges;
    }

    @IpcActionHandler('commit')
    async commit(option: GitCommitOptions): Promise<string> {
        const repository = await this.openRepository(option.workspaceDirPath);
        const signature = option.createdAt
            ? this.git.Signature.create(
                option.author.name,
                option.author.email,
                option.createdAt.time,
                option.createdAt.offset,
            )
            : this.git.Signature.now(option.author.name, option.author.email);

        const commitId = await repository.createCommitOnHead(option.filesToAdd, signature, signature, option.message);

        signature.free();
        repository.free();

        return commitId.tostrS();
    }

    @IpcActionHandler('getCommitHistory')
    async getCommitHistory(options: GitGetHistoryOptions): Promise<GitGetHistoryResult> {
        const repository = await this.openRepository(options.workspaceDirPath);
        const walker = repository.createRevWalk();

        options.commitId
            ? walker.push(Oid.fromString(options.commitId))
            : walker.pushHead();

        walker.sorting(Revwalk.SORT.TIME);

        let history: VcsCommitItem[];

        // If date range provided, find commits for period.
        if (options.dateRange) {
            const until = new Date(options.dateRange.until);
            const since = new Date(options.dateRange.since);

            // Unexpected behavior.
            // We need to check if the last item aborted the checkFn.
            // 'getCommitsUntil' returns the last item, even if it does not satisfied the checkFn.
            // So we should drop the last item.
            let isLastAborted = false;
            const isCommitCreatedAfterSince = (commit: Commit) => {
                const isAfterOrSame = datetime.isAfterOrSame(new Date(commit.timeMs()), since, DateUnits.DAY);
                isLastAborted = !isAfterOrSame;

                return isAfterOrSame;
            };

            const isCommitCreatedBeforeUntil =
                (commit: Commit) => datetime.isBeforeOrSame(new Date(commit.timeMs()), until, DateUnits.DAY);

            const foundCommits = await walker.getCommitsUntil(isCommitCreatedAfterSince) as Commit[];
            foundCommits.reverse();

            // Drop the last item (but in this line, array has been reversed, so it would be the first item)
            if (isLastAborted) {
                foundCommits.shift();
            }

            const startIndex = foundCommits.findIndex(commit => !isCommitCreatedBeforeUntil(commit));

            if (startIndex !== -1) {
                const removedCommits = foundCommits.splice(startIndex, foundCommits.length - startIndex);
                removedCommits.forEach(commit => commit.free());
            }

            history = foundCommits.reverse().map(commit => this.parseCommit(commit));
            foundCommits.forEach(commit => commit.free());
        } else {
            const commits = await walker.getCommits(options.size);

            history = commits.map(commit => this.parseCommit(commit));
            commits.forEach(commit => commit.free());
        }

        const result = {
            history,
            next: null,
            previous: { ...options },
        };

        // Check for next request.
        try {
            const next = await walker.next();
            result.next = {
                workspaceDirPath: options.workspaceDirPath,
                commitId: next.tostrS(),
                size: options.size,
            };
        } catch (error) {
            // There is no next commit.
        }

        /** NOTE: '@types/nodegit' is incorrect. */
        (<any>walker).free();
        repository.free();

        return result;
    }

    handleError(error: any): GitError | any {
        const out = error.message;

        if (out) {
            for (const code of Object.keys(gitErrorRegexes)) {
                if (gitErrorRegexes[code].test(out)) {
                    return this.createMatchedError(code as GitErrorCodes);
                }
            }
        }

        return error;
    }

    private createMatchedError(code: GitErrorCodes): GitError {
        switch (code) {
            case GitErrorCodes.AUTHENTICATION_FAIL:
                return new GitAuthenticationFailError();
        }
    }

    private parseFileChange(workingDir: string, status: StatusFile): VcsFileChange {
        let fileChange = {
            filePath: status.path(),
            workingDirectoryPath: workingDir,
            absoluteFilePath: path.resolve(workingDir, status.path()),
        } as VcsFileChange;

        if (status.isNew()) {
            fileChange = { ...fileChange, status: VcsFileChangeStatusTypes.NEW };
        } else if (status.isRenamed()) {
            const diff = status.headToIndex();

            /** NOTE: '@types/nodegit' is incorrect. */
            const oldFile = (diff as any).oldFile() as DiffFile;
            const newFile = (diff as any).newFile() as DiffFile;

            fileChange = {
                ...fileChange,
                status: VcsFileChangeStatusTypes.RENAMED,
                headToIndexDiff: {
                    oldFilePath: oldFile.path(),
                    newFilePath: newFile.path(),
                },
            };
        } else if (status.isModified()) {
            fileChange = { ...fileChange, status: VcsFileChangeStatusTypes.MODIFIED };
        } else if (status.isDeleted()) {
            fileChange = { ...fileChange, status: VcsFileChangeStatusTypes.REMOVED };
        }

        // TODO: Handle ignored, conflicted file changes.

        return fileChange;
    }

    private parseCommit(commit: Commit): VcsCommitItem {
        return {
            commitId: commit.id().tostrS(),
            commitHash: commit.sha(),
            authorName: commit.author().name(),
            authorEmail: commit.author().email(),
            committerName: commit.author().name(),
            committerEmail: commit.author().email(),
            summary: commit.summary(),
            description: commit.body(),
            timestamp: commit.timeMs(),
        };
    }
}
