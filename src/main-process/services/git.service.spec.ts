import { expect } from 'chai';
import * as fse from 'fs-extra';
import * as _git from 'nodegit';
import { EOL } from 'os';
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

    describe('getCommitHistory', () => {
        const author = new VcsAccountDummy().create();
        const messages: { summary: string, description: string }[] = [
            { summary: 'summary1', description: 'description1' },
            { summary: 'summary2', description: 'description2' },
            { summary: 'summary3', description: 'description3' },
            { summary: 'summary4', description: 'description4' },
            { summary: 'summary5', description: 'description5' },
        ];

        beforeEach(async () => {
            await makeTmpPath(true);

            const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map(name => path.resolve(tmpPath, name));
            await Promise.all(files.map(file => fse.writeFile(file, 'data')));

            const time = Math.floor(new Date().getTime() / 1000);

            // TODO(@seokju-na): CLEAN CODE PLEASE !!!

            await git.commit({
                workspaceDirPath: tmpPath,
                filesToAdd: ['a', 'b'],
                author,
                message: `${messages[0].summary}${EOL}${EOL}${messages[0].description}`,
                createdAt: {
                    time,
                    offset: 0,
                },
            });

            await git.commit({
                workspaceDirPath: tmpPath,
                filesToAdd: ['c', 'd'],
                author,
                message: `${messages[1].summary}${EOL}${EOL}${messages[1].description}`,
                createdAt: {
                    time: time + 1,
                    offset: 0,
                },
            });

            await git.commit({
                workspaceDirPath: tmpPath,
                filesToAdd: ['e'],
                author,
                message: `${messages[2].summary}${EOL}${EOL}${messages[2].description}`,
                createdAt: {
                    time: time + 2,
                    offset: 0,
                },
            });

            await git.commit({
                workspaceDirPath: tmpPath,
                filesToAdd: ['f'],
                author,
                message: `${messages[3].summary}${EOL}${EOL}${messages[3].description}`,
                createdAt: {
                    time: time + 3,
                    offset: 0,
                },
            });

            await git.commit({
                workspaceDirPath: tmpPath,
                filesToAdd: ['g'],
                author,
                message: `${messages[4].summary}${EOL}${EOL}${messages[4].description}`,
                createdAt: {
                    time: time + 4,
                    offset: 0,
                },
            });
        });

        it('should get history.', async () => {
            const first = await git.getCommitHistory({
                workspaceDirPath: tmpPath,
                size: 3,
            });

            expect(first.history.length).to.equals(3);
            expect(first.history[0].summary).to.equals(messages[4].summary);
            expect(first.history[1].summary).to.equals(messages[3].summary);
            expect(first.history[2].summary).to.equals(messages[2].summary);

            expect(first.next).not.to.equals(null);

            const second = await git.getCommitHistory(first.next);

            expect(second.history.length).to.equals(2);
            expect(second.history[0].summary).to.equals(messages[1].summary);
            expect(second.history[1].summary).to.equals(messages[0].summary);

            expect(second.next).to.equals(null);
        });
    });
});
