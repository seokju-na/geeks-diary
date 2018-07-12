import { Repository, StatusFile } from 'nodegit';
import * as nodeGit from 'nodegit';
import { GitError, GitErrorRegexes } from '../../libs/git-errors';
import { IpcActionHandler } from '../../libs/ipc';
import { Service } from '../interfaces/service';


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

    handleError(error: any): GitError | any {
        const out = error.message;

        if (out) {
            for (const regex in GitErrorRegexes) {
                if (out.match(regex)) {
                    return (GitErrorRegexes as any)[regex];
                }
            }
        }

        return error;
    }
}
