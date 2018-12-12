import * as nodeGit from 'nodegit';
import { CloneOptions, Commit, DiffDelta, DiffFile, FetchOptions, Oid, Repository, Revwalk, StatusFile } from 'nodegit';
import * as path from 'path';
import {
    GitAuthenticationFailError,
    GitCloneOptions,
    GitCommitOptions,
    GitError,
    GitErrorCodes,
    gitErrorRegexes,
    GitFindRemoteOptions,
    GitGetHistoryOptions,
    GitGetHistoryResult,
    GitMergeConflictedError,
    GitNetworkError,
    GitRemoteNotFoundError,
    GitSetRemoteOptions,
    GitSyncWithRemoteOptions,
    GitSyncWithRemoteResult,
} from '../../core/git';
import {
    VcsAuthenticationInfo,
    VcsAuthenticationTypes,
    VcsCommitItem,
    VcsFileChange,
    VcsFileChangeStatusTypes,
} from '../../core/vcs';
import { datetime, DateUnits } from '../../libs/datetime';
import { IpcActionHandler } from '../../libs/ipc';
import { Service } from './service';


let uniqueId = 0;

interface FetchOptionsWithTriesInfo {
    fetchOptions: FetchOptions;
    triesKey: string | null;
}


export class GitService extends Service {
    private git = nodeGit;
    private fetchTriesMap = new Map<string, number>();

    constructor() {
        super('git');
    }

    init(): void {
    }

    destroy(): void {
        super.destroy();
        this.fetchTriesMap.clear();
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
        const { triesKey, fetchOptions } = this.getFetchOptions(options.authentication);
        const cloneOptions: CloneOptions = {
            fetchOpts: fetchOptions,
            bare: 0,
        };

        const repository = await this.git.Clone.clone(
            options.url,
            options.localPath,
            cloneOptions,
        );

        if (triesKey) {
            this.fetchTriesMap.delete(triesKey);
        }

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

    @IpcActionHandler('isRemoteExists')
    async isRemoteExists(options: GitFindRemoteOptions): Promise<boolean> {
        const repository = await this.openRepository(options.workspaceDirPath);

        try {
            const remote = await repository.getRemote(options.remoteName);
            remote.free();
            return true;
        } catch (error) {
            if (gitErrorRegexes[GitErrorCodes.REMOTE_NOT_FOUND].test(error.message)) {
                return false;
            } else {
                throw error;
            }
        }
    }

    @IpcActionHandler('getRemoteUrl')
    async getRemoteUrl(options: GitFindRemoteOptions): Promise<string> {
        const repository = await this.openRepository(options.workspaceDirPath);
        const remote = await repository.getRemote(options.remoteName);
        const remoteUrl = remote.url();

        remote.free();
        repository.free();

        return remoteUrl;
    }

    @IpcActionHandler('setRemote')
    async setRemote(options: GitSetRemoteOptions): Promise<void> {
        const { remoteName, remoteUrl } = options;
        const repository = await this.openRepository(options.workspaceDirPath);

        // If remote already exists, delete first.
        try {
            await this.git.Remote.lookup(repository, remoteName);
            await this.git.Remote.delete(repository, remoteName);
        } catch (error) {
            const message = error.message ? error.message : '';

            // Only remote not found error accepted. Other should be thrown.
            if (!gitErrorRegexes[GitErrorCodes.REMOTE_NOT_FOUND].test(message)) {
                repository.free();
                throw error;
            }
        }

        try {
            await this.git.Remote.create(repository, remoteName, remoteUrl);
        } catch (error) {
            throw error;
        } finally {
            repository.free();
        }
    }

    @IpcActionHandler('syncWithRemote')
    async syncWithRemote(options: GitSyncWithRemoteOptions): Promise<GitSyncWithRemoteResult> {
        const repository = await this.openRepository(options.workspaceDirPath);

        // Pull
        const pullFetchOptions = this.getFetchOptions(options.authentication);
        const signature = this.git.Signature.now(options.author.name, options.author.email);

        await repository.fetchAll(pullFetchOptions.fetchOptions);

        try {
            await repository.mergeBranches(
                'master',
                `${options.remoteName}/master`,
                signature,
                this.git.Merge.PREFERENCE.NONE,
            );
        } catch (index) { // Repository#mergeBranchs throws index as error.
            throw new GitMergeConflictedError();
        }

        this.fetchTriesMap.delete(pullFetchOptions.triesKey);

        // Push
        const pushFetchOptions = this.getFetchOptions(options.authentication);
        const remote = await repository.getRemote(options.remoteName);

        await remote.push(
            ['refs/heads/master:refs/heads/master'],
            { callbacks: pushFetchOptions.fetchOptions.callbacks },
        );

        this.fetchTriesMap.delete(pushFetchOptions.triesKey);

        const result: GitSyncWithRemoteResult = {
            timestamp: Date.now(),
            remoteUrl: remote.url(),
        };

        remote.free();
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
            case GitErrorCodes.REMOTE_NOT_FOUND:
                return new GitRemoteNotFoundError();
            case GitErrorCodes.NETWORK_ERROR:
                return new GitNetworkError();
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
            fileChange = {
                ...fileChange,
                status: VcsFileChangeStatusTypes.RENAMED,
            };

            let diff: DiffDelta;

            if (status.inIndex()) {
                diff = status.headToIndex();
            } else if (status.inWorkingTree()) {
                diff = status.indexToWorkdir();
            }

            if (diff) {
                /** NOTE: '@types/nodegit' is incorrect. */
                const oldFile = (diff as any).oldFile() as DiffFile;
                const newFile = (diff as any).newFile() as DiffFile;

                fileChange = {
                    ...fileChange,
                    headToIndexDiff: {
                        oldFilePath: oldFile.path(),
                        newFilePath: newFile.path(),
                    },
                };
            }
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

    /** Get fetch options. */
    private getFetchOptions(authentication?: VcsAuthenticationInfo): FetchOptionsWithTriesInfo {
        let key: string = null;
        const options: FetchOptions = {
            callbacks: {},
        };

        // Github will fail cert check on some OSX machines
        // This overrides that check.
        options.callbacks.certificateCheck = () => 1;

        if (authentication) {
            key = `git-fetch-try-${uniqueId++}`;
            this.fetchTriesMap.set(key, 0);

            options.callbacks.credentials = () => {
                const tries = this.fetchTriesMap.get(key);

                /**
                 * Note that this is important.
                 * libgit2 doesn't stop checking credential even if authorize failed.
                 * So if we do not take proper action, we will end up in an infinite loop.
                 * See also:
                 *  https://github.com/nodegit/nodegit/issues/1133
                 *
                 * Check if tries goes at least 5, throw error to exit the infinite loop.
                 */
                if (tries > 5) {
                    throw new Error('Authentication Error');
                }

                this.fetchTriesMap.set(key, tries + 1);

                switch (authentication.type) {
                    case VcsAuthenticationTypes.BASIC:
                        return this.git.Cred.userpassPlaintextNew(
                            authentication.username,
                            authentication.password,
                        );

                    case VcsAuthenticationTypes.OAUTH2_TOKEN:
                        return this.git.Cred.userpassPlaintextNew(
                            authentication.token,
                            'x-oauth-basic',
                        );
                }
            };
        }

        return {
            triesKey: key,
            fetchOptions: options,
        };
    }
}
