import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, flushMicrotasks, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { createDummies, dispatchFakeEvent, fastTestSetup, typeInElement } from '../../../../../test/helpers';
import { MockDialog, MockDialogRef } from '../../../../../test/mocks/browser';
import { VcsAccountDummy } from '../../../../core/dummies';
import { VcsAccount, VcsAuthenticationTypes } from '../../../../core/vcs';
import { DialogRef } from '../../../ui/dialog';
import { RadioButtonComponent } from '../../../ui/radio';
import { UiModule } from '../../../ui/ui.module';
import { VCS_ACCOUNT_DATABASE, VcsAccountDatabase, VcsAccountDatabaseProvider } from '../../vcs-account-database';
import { VcsAccountItemComponent } from '../../vcs-view';
import { VcsService } from '../../vcs.service';
import { VcsRemoteGithubProvider } from '../vcs-remote-github-provider';
import { VcsRemoteProviderFactory } from '../vcs-remote-provider-factory';
import { GithubAccountsDialogComponent } from './github-accounts-dialog.component';
import Spy = jasmine.Spy;


describe('browser.vcs.vcsAuthentication.GithubAccountsDialogComponent', () => {
    let fixture: ComponentFixture<GithubAccountsDialogComponent>;
    let component: GithubAccountsDialogComponent;

    let mockDialog: MockDialog;
    let mockDialogRef: MockDialogRef<GithubAccountsDialogComponent>;
    let vcs: VcsService;
    let accountDB: VcsAccountDatabase;

    const vcsAccountDummy = new VcsAccountDummy();

    function makeAccountsToBeLoadedWith(
        accounts: VcsAccount[] = createDummies(vcsAccountDummy, 5),
    ): VcsAccount[] {
        // If it is already spy...
        if ((accountDB.getAllAccounts as Spy).and) {
            (accountDB.getAllAccounts as Spy).and.returnValue(Promise.resolve(accounts));
        } else {
            spyOn(accountDB, 'getAllAccounts').and.returnValue(Promise.resolve(accounts));
        }

        return accounts;
    }

    function switchAuthMethodOption(type: VcsAuthenticationTypes): void {
        const options = fixture.debugElement.queryAll(By.directive(RadioButtonComponent));
        const option = options.find(opt => opt.componentInstance.value === type);

        if (option) {
            const inputEl = option.query(By.css('input[type=radio]'));

            dispatchFakeEvent(inputEl.nativeElement, 'change');
            fixture.detectChanges();
        }
    }

    const getAccountItemDeList = (): DebugElement[] => fixture.debugElement.queryAll(
        By.css('.GithubAccountsDialog__accounts > gd-vcs-account-item'),
    );

    const getUserNameInputEl = (): HTMLInputElement =>
        fixture.debugElement.query(By.css('#github-username-input')).nativeElement as HTMLInputElement;

    const getPasswordInputEl = (): HTMLInputElement =>
        fixture.debugElement.query(By.css('#github-password-input')).nativeElement as HTMLInputElement;

    const getTokenInputEl = (): HTMLInputElement =>
        fixture.debugElement.query(By.css('#github-token-input')).nativeElement as HTMLInputElement;

    const getLoginAndAddAccountButtonEl = (): HTMLButtonElement =>
        fixture.debugElement.query(
            By.css('.GithubAccountsDialog__loginAndAddAccountButton'),
        ).nativeElement as HTMLButtonElement;

    fastTestSetup();

    beforeAll(async () => {
        mockDialog = new MockDialog();
        mockDialogRef = new MockDialogRef(mockDialog, GithubAccountsDialogComponent);

        vcs = jasmine.createSpyObj('vcs', [
            'setRemoveProvider',
            'loginRemoteWithBasicAuthorization',
            'loginRemoteWithOauth2TokenAuthorization',
        ]);

        (vcs.setRemoveProvider as Spy).and.returnValue(vcs);

        await TestBed
            .configureTestingModule({
                imports: [
                    UiModule,
                    HttpClientTestingModule,
                    NoopAnimationsModule,
                    ...MockDialog.imports(),
                ],
                providers: [
                    ...MockDialog.providers(),
                    { provide: VcsService, useValue: vcs },
                    { provide: DialogRef, useValue: mockDialogRef },
                    VcsRemoteProviderFactory,
                    VcsAccountDatabaseProvider,
                ],
                declarations: [
                    VcsAccountItemComponent,
                    GithubAccountsDialogComponent,
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        accountDB = TestBed.get(VCS_ACCOUNT_DATABASE);

        fixture = TestBed.createComponent(GithubAccountsDialogComponent);
        component = fixture.componentInstance;
    });

    afterEach(async () => {
        await accountDB.accounts.clear();
    });

    describe('accounts list', () => {
        it('should load accounts from account database and show in the list.', fakeAsync(() => {
            const accounts = makeAccountsToBeLoadedWith();
            fixture.detectChanges();

            flushMicrotasks();
            fixture.detectChanges();

            fixture.whenStable().then(() => fixture.detectChanges());
            flush();

            const itemDeList = getAccountItemDeList();

            expect(itemDeList.length).toEqual(accounts.length);
            itemDeList.forEach((itemDe, index) => {
                expect((itemDe.componentInstance as VcsAccountItemComponent).account).toEqual(accounts[index]);
            });
        }));

        it('should show empty state if there are not accounts exists.', fakeAsync(() => {
            makeAccountsToBeLoadedWith([]);
            fixture.detectChanges();

            flushMicrotasks();
            fixture.detectChanges();

            expect(fixture.debugElement.query(By.css('.GithubAccountsDialog__emptyState'))).not.toBeNull();
        }));

        // TODO(@seokju-na): Cannot test focus key manager.
        // For some reason, a '1 timer(s) run in the queue' error occurs when I dispatch the key event.
        // I think we should research this area when we can afford it later.
    });

    describe('accounts tools', () => {
        it('should remove account and reload accounts when click remove account button.', fakeAsync(() => {
            makeAccountsToBeLoadedWith();

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            // Next load
            spyOn(accountDB, 'deleteAccountByEmail').and.callThrough();
            makeAccountsToBeLoadedWith(createDummies(vcsAccountDummy, 4));

            const target = getAccountItemDeList()[1];
            (target.componentInstance as VcsAccountItemComponent).removeThis.emit();

            flushMicrotasks();
            fixture.detectChanges();

            expect(accountDB.deleteAccountByEmail)
                .toHaveBeenCalledWith((target.componentInstance as VcsAccountItemComponent).account.email);
        }));
    });

    describe('login and add account form', () => {
        it('should authorize with basic and add account. After add new account completes, '
            + 'should reset form.', fakeAsync(() => {
            makeAccountsToBeLoadedWith();

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            switchAuthMethodOption(VcsAuthenticationTypes.BASIC);

            typeInElement('username', getUserNameInputEl());
            typeInElement('password', getPasswordInputEl());
            fixture.detectChanges();

            const newAccount = vcsAccountDummy.create(VcsAuthenticationTypes.BASIC);

            spyOn(component['github'] as VcsRemoteGithubProvider, 'authorizeByBasic')
                .and.returnValue(of(newAccount));
            spyOn(accountDB, 'addNewAccount').and.callThrough();

            getLoginAndAddAccountButtonEl().click();
            flush();

            expect((component['github'] as VcsRemoteGithubProvider).authorizeByBasic)
                .toHaveBeenCalledWith('username', 'password');
            expect(accountDB.addNewAccount).toHaveBeenCalledWith(newAccount);

            // Should form reset
            expect(component.addAccountFormGroup.value).toEqual({
                type: VcsAuthenticationTypes.BASIC,
                userName: '',
                password: '',
                token: '',
            });
        }));

        it('should authorize with oauth2 token and add account. After add new account completes, '
            + 'should reset form.', fakeAsync(() => {
            makeAccountsToBeLoadedWith();

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            switchAuthMethodOption(VcsAuthenticationTypes.OAUTH2_TOKEN);

            typeInElement('token', getTokenInputEl());
            fixture.detectChanges();

            const newAccount = vcsAccountDummy.create(VcsAuthenticationTypes.OAUTH2_TOKEN);

            spyOn(component['github'] as VcsRemoteGithubProvider, 'authorizeByOauth2Token')
                .and.returnValue(of(newAccount));
            spyOn(accountDB, 'addNewAccount').and.callThrough();

            getLoginAndAddAccountButtonEl().click();
            flush();

            expect((component['github'] as VcsRemoteGithubProvider).authorizeByOauth2Token)
                .toHaveBeenCalledWith('token');
            expect(accountDB.addNewAccount).toHaveBeenCalledWith(newAccount);

            // Should form reset
            expect(component.addAccountFormGroup.value).toEqual({
                type: VcsAuthenticationTypes.OAUTH2_TOKEN,
                userName: '',
                password: '',
                token: '',
            });
        }));
    });
});
