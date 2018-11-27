import * as nodeGit from 'nodegit';
import { CloneOptions, Commit, DiffFile, Oid, Repository, Revwalk, StatusFile } from 'nodegit';
import * as path from 'path';
import {
    GitCloneOptions,
    GitCommitOptions,
    GitError,
    gitErrorRegexes,
    GitGetHistoryOptions,
    GitGetHistoryResult,
} from '../../core/git';
import { VcsAuthenticationTypes, VcsCommitItem, VcsFileChange, VcsFileChangeStatusTypes } from '../../core/vcs';
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

        const commits = await walker.getCommits(options.size);
        const history = commits.map(commit => this.parseCommit(commit));

        commits.forEach(commit => commit.free());

        // Check for next request.
        const result: GitGetHistoryResult = {
            history,
            next: null,
            previous: { ...options },
        };

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
                    return new GitError(code);
                }
            }
        }

        return error;
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
