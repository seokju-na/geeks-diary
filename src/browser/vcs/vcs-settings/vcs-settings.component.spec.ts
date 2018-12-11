import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import {
    createDummies,
    dispatchMouseEvent,
    expectDom,
    fastTestSetup,
    getVisibleErrorAt,
    typeInElement,
} from '../../../../test/helpers';
import { MockDialog } from '../../../../test/mocks/browser';
import { VcsAccountDummy } from '../../../core/dummies';
import { VcsRepositoryNotExistsError } from '../../../core/vcs';
import { GitService, SharedModule } from '../../shared';
import { Dialog } from '../../ui/dialog';
import { MenuItem } from '../../ui/menu';
import { UiModule } from '../../ui/ui.module';
import { VCS_ACCOUNT_DATABASE, VcsAccountDatabase, VcsAccountDatabaseProvider } from '../vcs-account-database';
import { GithubAccountsDialogComponent } from '../vcs-remote';
import { VcsService } from '../vcs.service';
import { VcsSettingsComponent } from './vcs-settings.component';
import Spy = jasmine.Spy;


describe('browser.vcs.vcsSettings.VcsSettingsComponent', () => {
    let component: VcsSettingsComponent;
    let fixture: ComponentFixture<VcsSettingsComponent>;

    let mockDialog: MockDialog;
    let accountDB: VcsAccountDatabase;
    let vcs: VcsService;
    let git: GitService;

    const accountDummy = new VcsAccountDummy();

    function ignoreAccountsGetting(): void {
        component['loadAccounts'] = jasmine.createSpy('private method');
    }

    function ignoreFetchAccountGetting(): void {
        component['getFetchAccountAndPatchFormValueIfExists'] =
            jasmine.createSpy('getFetchAccountAndPatchFormValueIfExists private method');
    }

    function ignoreRemoteUrlGetting(): void {
        component['getRemoteUrlAndPatchFormValueIfExists'] =
            jasmine.createSpy('getRemoteUrlAndPatchFormValueIfExists private method');
    }

    const getAccountSelectEl = (): HTMLElement =>
        fixture.debugElement.query(By.css('#vcs-remote-setting-github-account-select')).nativeElement;

    const getRemoteUrlFormFieldDe = (): DebugElement =>
        fixture.debugElement.query(By.css('#vcs-remote-setting-url-form-field'));

    const getRemoteUrlInputEl = (): HTMLInputElement =>
        fixture.debugElement.query(By.css('#vcs-remote-setting-url-input')).nativeElement as HTMLInputElement;

    const getSaveRemoteButtonEl = (): HTMLButtonElement =>
        fixture.debugElement.query(By.css('.VcsSettings__saveRemoteButton')).nativeElement as HTMLButtonElement;

    const getSaveRemoteResultMessageEl = (): HTMLElement =>
        fixture.debugElement.query(By.css('.VcsSettings__saveRemoteResultMessage')).nativeElement as HTMLElement;

    fastTestSetup();

    beforeAll(async () => {
        mockDialog = new MockDialog();
        vcs = jasmine.createSpyObj('vcs', [
            'setRemoveProvider',
            'isRemoteRepositoryUrlValid',
            'findRemoteRepository',
            'setRemoteRepository',
            'getRepositoryFetchAccount',
            'getRemoteRepositoryUrl',
        ]);

        (vcs.setRemoveProvider as Spy).and.returnValue(vcs);

        await TestBed
            .configureTestingModule({
                imports: [
                    UiModule,
                    SharedModule,
                ],
                providers: [
                    VcsAccountDatabaseProvider,
                    { provide: VcsService, useValue: vcs },
                ],
                declarations: [
                    VcsSettingsComponent,
                ],
            })
            .overrideComponent(VcsSettingsComponent, {
                set: {
                    providers: [{ provide: Dialog, useValue: mockDialog }],
                },
            })
            .compileComponents();
    });

    beforeEach(() => {
        accountDB = TestBed.get(VCS_ACCOUNT_DATABASE);
        git = TestBed.get(GitService);

        fixture = TestBed.createComponent(VcsSettingsComponent);
        component = fixture.componentInstance;
    });

    afterEach(async () => {
        await accountDB.accounts.clear();
    });

    describe('remote setting', () => {
        it('should get all accounts from account database on ngOnInit.', fakeAsync(() => {
            ignoreFetchAccountGetting();
            ignoreRemoteUrlGetting();

            const accounts = createDummies(accountDummy, 10);
            spyOn(accountDB, 'getAllAccounts').and.returnValue(Promise.resolve(accounts));

            // Expect to fetch accounts.
            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            expect(component.accountMenuItems).toEqual(accounts.map(account => ({
                id: account.email,
                label: `${account.name} <${account.email}>`,
            } as MenuItem)));
        }));

        // FIXME LATER
        xit('should open github accounts dialog when click \'add account\' button. After dialog '
            + 'closed, should reload all accounts from account database.', fakeAsync(() => {
            const prevAccounts = createDummies(accountDummy, 5);
            spyOn(accountDB, 'getAllAccounts').and.returnValue(Promise.resolve(prevAccounts));

            fixture.detectChanges();
            flushMicrotasks();
            fixture.detectChanges();

            expect(component.accountMenuItems).toEqual(prevAccounts.map(account => ({
                id: account.email,
                label: `${account.name} <${account.email}>`,
            } as MenuItem)));

            // First, we should open menu...
            const menuTriggerEl = getAccountSelectEl();
            dispatchMouseEvent(menuTriggerEl, 'mousedown');
            menuTriggerEl.click();
            tick();
            fixture.detectChanges();

            // Click add account button
            const addAccountButtonEl = document.querySelector('#add-github-account-button') as HTMLButtonElement;
            console.log(addAccountButtonEl);
            addAccountButtonEl.click();
            tick(500);
            fixture.detectChanges();

            const githubAccountsDialogRef = mockDialog.getByComponent<GithubAccountsDialogComponent>(
                GithubAccountsDialogComponent,
            );
            expect(githubAccountsDialogRef).toBeDefined();

            const nextAccounts = [...prevAccounts, ...createDummies(accountDummy, 5)];
            (accountDB.getAllAccounts as jasmine.Spy).and.returnValue(Promise.resolve(nextAccounts));

            githubAccountsDialogRef.close();
            flushMicrotasks();
            fixture.detectChanges();

            expect(component.accountMenuItems).toEqual(nextAccounts.map(account => ({
                id: account.email,
                label: `${account.name} <${account.email}>`,
            } as MenuItem)));
        }));

        it('should save remote button is disabled if github account is not selected.', () => {
            ignoreFetchAccountGetting();
            ignoreRemoteUrlGetting();
            ignoreAccountsGetting();

            fixture.detectChanges();

            (vcs.isRemoteRepositoryUrlValid as Spy).and.returnValue(true);

            // Github Account: invalid, Remote URL: valid
            typeInElement('https://github.com/seokju-na/geeks-diary', getRemoteUrlInputEl());
            component.remoteSettingForm.get('githubAccount').patchValue(null);
            fixture.detectChanges();

            expectDom(getSaveRemoteButtonEl()).toBeDisabled();
        });

        it('should save remote button is disabled if remote url is not input.', () => {
            ignoreFetchAccountGetting();
            ignoreRemoteUrlGetting();
            ignoreAccountsGetting();

            fixture.detectChanges();

            // Github Account: valid, Remote URL: invalid
            component.remoteSettingForm.get('githubAccount').patchValue(accountDummy.create());
            typeInElement('', getRemoteUrlInputEl());
            fixture.detectChanges();

            expectDom(getSaveRemoteButtonEl()).toBeDisabled();
        });

        it('should save remote button is disabled if remote url is not valid.', () => {
            ignoreFetchAccountGetting();
            ignoreRemoteUrlGetting();
            ignoreAccountsGetting();

            fixture.detectChanges();

            (vcs.isRemoteRepositoryUrlValid as Spy).and.returnValue(false);

            // Github Account: valid, Remote URL: invalid
            component.remoteSettingForm.get('githubAccount').patchValue(accountDummy.create());
            typeInElement('not_valid_url', getRemoteUrlInputEl());
            fixture.detectChanges();

            expectDom(getSaveRemoteButtonEl()).toBeDisabled();
        });

        it('should save remote button is not disabled if github account is selected and '
            + 'remote url is valid.', () => {
            ignoreFetchAccountGetting();
            ignoreRemoteUrlGetting();
            ignoreAccountsGetting();

            fixture.detectChanges();

            (vcs.isRemoteRepositoryUrlValid as Spy).and.returnValue(true);

            component.remoteSettingForm.get('githubAccount').patchValue(accountDummy.create());
            typeInElement('https://github.com/seokju-na/geeks-diary', getRemoteUrlInputEl());
            fixture.detectChanges();

            expectDom(getSaveRemoteButtonEl()).not.toBeDisabled();
        });

        it('should show repository not exists error if repository not exists in remote provider '
            + 'when submit remote setting form.', fakeAsync(() => {
            ignoreFetchAccountGetting();
            ignoreRemoteUrlGetting();
            ignoreAccountsGetting();
            fixture.detectChanges();

            const fetchAccount = accountDummy.create();
            const remoteUrl = 'https://github.com/seokju-na/geeks-diary.git';

            component.remoteSettingForm.patchValue({
                githubAccount: fetchAccount,
                remoteUrl,
            });
            fixture.detectChanges();

            (vcs.findRemoteRepository as Spy).and.returnValue(throwError(new VcsRepositoryNotExistsError()));

            getSaveRemoteButtonEl().click();
            flush();
            fixture.detectChanges();

            expect(vcs.findRemoteRepository).toHaveBeenCalledWith(remoteUrl, fetchAccount.authentication);
            expect(getVisibleErrorAt(getRemoteUrlFormFieldDe()).errorName).toEqual('repositoryNotExists');
        }));

        it('should show success message if set remote repository success when submit '
            + 'remote settings form.', fakeAsync(() => {
            ignoreFetchAccountGetting();
            ignoreRemoteUrlGetting();
            ignoreAccountsGetting();
            fixture.detectChanges();

            const fetchAccount = accountDummy.create();
            const remoteUrl = 'https://github.com/seokju-na/geeks-diary.git';

            component.remoteSettingForm.patchValue({
                githubAccount: fetchAccount,
                remoteUrl,
            });
            fixture.detectChanges();

            (vcs.findRemoteRepository as Spy).and.returnValue(of(null));
            (vcs.setRemoteRepository as Spy).and.returnValue(of(null));

            getSaveRemoteButtonEl().click();
            flush();
            fixture.detectChanges();

            expect(vcs.setRemoteRepository).toHaveBeenCalledWith(fetchAccount, remoteUrl);

            expectDom(getSaveRemoteResultMessageEl())
                .toContainClasses('VcsSettings__saveRemoteResultMessage--success');
            expectDom(getSaveRemoteResultMessageEl())
                .toContainText(component.saveRemoteResultMessage);
        }));

        it('should show fail message if set remote repository fail when submit '
            + 'remote setting form', fakeAsync(() => {
            ignoreFetchAccountGetting();
            ignoreRemoteUrlGetting();
            ignoreAccountsGetting();
            fixture.detectChanges();

            const fetchAccount = accountDummy.create();
            const remoteUrl = 'https://github.com/seokju-na/geeks-diary.git';

            component.remoteSettingForm.patchValue({
                githubAccount: fetchAccount,
                remoteUrl,
            });
            fixture.detectChanges();

            (vcs.findRemoteRepository as Spy).and.returnValue(of(null));
            (vcs.setRemoteRepository as Spy).and.returnValue(throwError(new Error('Some Error')));

            getSaveRemoteButtonEl().click();
            flush();
            fixture.detectChanges();

            expect(vcs.setRemoteRepository).toHaveBeenCalledWith(fetchAccount, remoteUrl);

            expectDom(getSaveRemoteResultMessageEl())
                .toContainClasses('VcsSettings__saveRemoteResultMessage--fail');
            expectDom(getSaveRemoteResultMessageEl())
                .toContainText(component.saveRemoteResultMessage);
        }));

        it('should set github account if fetch repository account is exists on ngOnInit.', () => {
            ignoreRemoteUrlGetting();
            ignoreAccountsGetting();

            const fetchAccount = accountDummy.create();
            (vcs.getRepositoryFetchAccount as Spy).and.returnValue(of(fetchAccount));
            fixture.detectChanges();

            expect(component.remoteSettingForm.get('githubAccount').value).toEqual(fetchAccount);
        });

        it('should set remote url if remote url is exists on ngOnInit.', () => {
            ignoreFetchAccountGetting();
            ignoreAccountsGetting();

            const remoteUrl = 'https://github.com/seokju-na/geeks-diary.git';
            (vcs.getRemoteRepositoryUrl as Spy).and.returnValue(of(remoteUrl));
            fixture.detectChanges();

            expect(component.remoteSettingForm.get('remoteUrl').value).toEqual(remoteUrl);
        });
    });
});
