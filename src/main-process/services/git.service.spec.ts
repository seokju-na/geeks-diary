import { expect } from 'chai';
import * as fse from 'fs-extra';
import * as _git from 'nodegit';
import * as path from 'path';
import { VcsAccountDummy, VcsAuthenticationInfoDummy } from '../../core/dummies';
import { GitMergeConflictedError } from '../../core/git';
import { VcsFileChange, VcsFileChangeStatusTypes } from '../../core/vcs';
import { datetime, DateUnits } from '../../libs/datetime';
import { GitService } from './git.service';


describe('mainProcess.services.GitService', () => {
    let git: GitService;
    const tmpPath = path.resolve(process.cwd(), 'tmp/');

    function getFixturePath(name: string): string {
        return path.resolve(process.cwd(), 'test/workspace-fixtures/', name, '_git/');
    }

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

        async function commitFile(fileName: string, timestamp: number, message: string): Promise<void> {
            const filePath = path.resolve(tmpPath, fileName);
            await fse.writeFile(filePath, 'data');

            await git.commit({
                workspaceDirPath: tmpPath,
                filesToAdd: [fileName],
                author,
                message,
                createdAt: {
                    time: Math.floor(timestamp / 1000),
                    offset: 0,
                },
            });
        }

        beforeEach(async () => {
            await makeTmpPath(true);
        });

        it('should get history by pagination.', async () => {
            // Make commits.
            const timestamp = new Date().getTime();

            await commitFile('a', timestamp, 'message1');
            await commitFile('b', timestamp + 1000, 'message2');
            await commitFile('c', timestamp + 2000, 'message3');
            await commitFile('d', timestamp + 3000, 'message4');
            await commitFile('e', timestamp + 4000, 'message5');

            // First load
            const first = await git.getCommitHistory({
                workspaceDirPath: tmpPath,
                size: 3,
            });

            expect(first.history.length).to.equals(3);
            expect(first.history[0].summary).to.equals('message5');
            expect(first.history[1].summary).to.equals('message4');
            expect(first.history[2].summary).to.equals('message3');

            expect(first.next).not.to.equals(null);

            const second = await git.getCommitHistory(first.next);

            expect(second.history.length).to.equals(2);
            expect(second.history[0].summary).to.equals('message2');
            expect(second.history[1].summary).to.equals('message1');

            expect(second.next).to.equals(null);
        });

        it('should get history by date range.', async () => {
            const today = datetime.today();
            const yesterday = datetime.today();
            datetime.add(yesterday, DateUnits.DAY, -1);

            const tomorrow = datetime.today();
            datetime.add(tomorrow, DateUnits.DAY, 1);

            await commitFile('a', yesterday.getTime(), 'yesterday');
            await commitFile('b', today.getTime(), 'today');
            await commitFile('c', tomorrow.getTime(), 'tomorrow');

            const yesterdayAndToday = await git.getCommitHistory({
                workspaceDirPath: tmpPath,
                dateRange: {
                    since: yesterday.getTime(),
                    until: today.getTime(),
                },
            });

            expect(yesterdayAndToday.history.length).to.equals(2);
            expect(yesterdayAndToday.history[0].summary).to.equals('today');
            expect(yesterdayAndToday.history[1].summary).to.equals('yesterday');

            const todayAndTomorrow = await git.getCommitHistory({
                workspaceDirPath: tmpPath,
                dateRange: {
                    since: today.getTime(),
                    until: tomorrow.getTime(),
                },
            });

            expect(todayAndTomorrow.history.length).to.equals(2);
            expect(todayAndTomorrow.history[0].summary).to.equals('tomorrow');
            expect(todayAndTomorrow.history[1].summary).to.equals('today');

            const farFuture = datetime.today();
            datetime.add(farFuture, DateUnits.DAY, 5);

            const nothing = await git.getCommitHistory({
                workspaceDirPath: tmpPath,
                dateRange: {
                    since: farFuture.getTime(),
                    until: farFuture.getTime(),
                },
            });

            expect(nothing.history.length).to.equals(0);
        });
    });

    describe('isRemoteExists', () => {
        beforeEach(async () => {
            await makeTmpPath(true);
        });

        it('should return \'false\' if repository has not remote.', async () => {
            const result = await git.isRemoteExists({
                workspaceDirPath: tmpPath,
                remoteName: 'origin',
            });

            expect(result).to.equals(false);
        });
    });

    describe('setRemote', () => {
        beforeEach(async () => {
            await makeTmpPath(true);
        });

        it('should remove exists remote and set new remote.', async () => {
            const remoteName = 'origin';
            const prevRemoteUrl = 'previous_remote_url';
            const nextRemoteUrl = 'next_remote_url';

            // Set previous remote...
            const repo = await _git.Repository.open(tmpPath);
            await _git.Remote.create(repo, remoteName, prevRemoteUrl);

            await git.setRemote({
                workspaceDirPath: tmpPath,
                remoteName,
                remoteUrl: nextRemoteUrl,
            });

            // Check changed remote
            const remote = await repo.getRemote(remoteName);
            expect(remote.url()).to.equals(nextRemoteUrl);

            remote.free();
            repo.free();
        });
    });

    /**
     * NOTE: This tests require network connection.
     * If your network is slow, this test is likely to be timed out.
     */
    describe('syncWithRemote', () => {
        it('should throw \'MERGE_CONFLICTED\' error when conflict happens during merges '
            + 'fetched branch.', async () => {
            let error = null;

            try {
                await git.syncWithRemote({
                    workspaceDirPath: getFixturePath('conflict'),
                    remoteName: 'origin',
                    authentication: new VcsAuthenticationInfoDummy().create(),
                    author: new VcsAccountDummy().create(),
                });
            } catch (err) {
                error = err;
            }

            expect(error).not.equals(null);
            expect(error instanceof GitMergeConflictedError).to.equals(true);
        });
    });
});
