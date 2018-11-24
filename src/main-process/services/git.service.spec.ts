import { expect } from 'chai';
import * as fse from 'fs-extra';
import * as _git from 'nodegit';
import * as path from 'path';
import { VcsAccountDummy } from '../../core/dummies';
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

    describe('commit', () => {
        const testFiles: string[] = [];

        beforeEach(async () => {
            await makeTmpPath(true);

            const fileA = path.resolve(tmpPath, 'a');
            const fileB = path.resolve(tmpPath, 'b');

            await Promise.all([
                fse.writeFile(fileA, 'a data'),
                fse.writeFile(fileB, 'b data'),
            ]);

            testFiles.push('a', 'b');
        });

        it('should commit on head.', async () => {
            const author = new VcsAccountDummy().create();
            const commitId = await git.commit({
                workspaceDirPath: tmpPath,
                filesToAdd: testFiles,
                author,
                message: 'Summary\n\nDescription',
            });

            const repo = await _git.Repository.open(tmpPath);
            const headCommit = await repo.getHeadCommit();

            expect(headCommit.author().name()).to.equal(author.name);
            expect(headCommit.author().email()).to.equal(author.email);
            expect(headCommit.committer().name()).to.equal(author.name);
            expect(headCommit.committer().email()).to.equal(author.email);
            expect(headCommit.summary()).to.equal('Summary');
            expect(headCommit.message()).to.equal('Summary\n\nDescription');
            expect(headCommit.id().tostrS()).to.equal(commitId);

            headCommit.free();
            repo.free();
        });
    });
});
