import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { fastTestSetup } from '../../../test/helpers';
import { VcsAuthenticationInfoDummy } from '../../core/dummies';
import { GitCloneOptions } from '../../core/git';
import { GitService } from './git.service';


describe('browser.shared.GitService', () => {
    let git: GitService;

    fastTestSetup();

    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [GitService],
        });
    });

    beforeEach(() => {
        git = TestBed.get(GitService);
    });

    afterEach(() => {
        git.ngOnDestroy();
    });

    describe('ngOnDestroy', () => {
        it('should destroy ipc client on ngOnDestroy.', () => {
            spyOn(git['ipcClient'], 'destroy').and.callThrough();
            git.ngOnDestroy();

            expect((git['ipcClient'] as any).destroy as jasmine.Spy).toHaveBeenCalled();
        });
    });

    describe('cloneRepository', () => {
        it('should perform action with git clone options.', fakeAsync(() => {
            const performActionSpy =
                spyOn(git['ipcClient'], 'performAction').and.returnValue(Promise.resolve(null));

            const url = 'https://github.com/seokju-na/geeks-diary';
            const localPath = '/foo/bar/workspace';
            const vcsAuthInfo = new VcsAuthenticationInfoDummy().create();

            const callback = jasmine.createSpy('clone repository callback');
            const subscription = git.cloneRepository(
                url,
                localPath,
                vcsAuthInfo,
            ).subscribe(callback);

            flush();

            expect(performActionSpy).toHaveBeenCalledWith(
                'cloneRepository',
                { url, localPath, authentication: vcsAuthInfo } as GitCloneOptions,
            );
            expect(callback).toHaveBeenCalled();
            subscription.unsubscribe();
        }));
    });
});
