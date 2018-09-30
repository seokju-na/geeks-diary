import * as nodeGit from 'nodegit';
import { CloneOptions, Repository, StatusFile } from 'nodegit';
import { GitCloneOptions, GitError, gitErrorRegexes } from '../../core/git';
import { VcsAuthenticationTypes } from '../../core/vcs';
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

    @IpcActionHandler('createRepository')
    async createRepository(dirPath: string): Promise<void> {
        const repository = await this.git.Repository.init(dirPath, 0);

        repository.free();
    }

    @IpcActionHandler('openRepository')
    async openRepository(dirPath: string): Promise<Repository> {
        return this.git.Repository.open(dirPath);
    }

    @IpcActionHandler('getFileStatues')
    async getFileStatues(dirPath: string): Promise<StatusFile[]> {
        const repository = await this.openRepository(dirPath);
        const statues = await repository.getStatus();

        repository.free();

        return statues;
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
}
