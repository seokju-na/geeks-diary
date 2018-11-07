import { expect } from 'chai';
import * as fse from 'fs-extra';
import * as _git from 'nodegit';
import * as path from 'path';
import { VcsFileChange, VcsFileChangeStatusTypes } from '../../core/vcs';
import { GitService } from './git.service';


describe('mainProcess.services.GitService', () => {
    let git: GitService;
    const tmpPath = path.resolve(process.cwd(), 'tmp/');

    async function makeTmpPath(createGit: boolean = false): Promise<void> {
        await fse.ensureDir(tmpPath);

        if (createGit) {
            const repo = await _git.Repository.init(tmpPath, 0);
            repo.free();
        }
    }

    async function removeTmpPath(): Promise<void> {
        await fse.remove(tmpPath);
    }

    beforeEach(() => {
        git = new GitService();
        git.init();
    });

    afterEach(async () => {
        git.destroy();
        await removeTmpPath();
    });

    describe('isRepositoryExists', () => {
        it('should return false as promise if directory is not exists.', async () => {
            const result = await git.isRepositoryExists(tmpPath);
            expect(result).to.equal(false);
        });

        it('should return true as promise if directory is exists and its git directory.', async () => {
            await makeTmpPath(true);

            const result = await git.isRepositoryExists(tmpPath);
            expect(result).to.equal(true);
        });
    });

    describe('createRepository', () => {
        it('should create git repository.', async () => {
            await makeTmpPath();
            await git.createRepository(tmpPath);

            const isRepositoryExists = await git.isRepositoryExists(tmpPath);
            expect(isRepositoryExists).to.equal(true);
        });
    });

    describe('cloneRepository', () => {
    });

    describe('getFileChanges', () => {
        it('should return vcs file change list as promise.', async () => {
            await makeTmpPath(true);
            await fse.writeFile(path.resolve(tmpPath, 'test-file'), 'some data');

            const fileChanges = await git.getFileChanges(tmpPath);

            expect(fileChanges[0]).to.deep.equals({
                filePath: 'test-file',
                workingDirectoryPath: tmpPath,
                absoluteFilePath: path.resolve(tmpPath, 'test-file'),
                status: VcsFileChangeStatusTypes.NEW,
            } as VcsFileChange);
        });
    });
});
