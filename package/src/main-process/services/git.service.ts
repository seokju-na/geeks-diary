import { Repository, StatusFile } from 'nodegit';
import * as nodeGit from 'nodegit';
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

    handleError(error: any): any {
    }
}
