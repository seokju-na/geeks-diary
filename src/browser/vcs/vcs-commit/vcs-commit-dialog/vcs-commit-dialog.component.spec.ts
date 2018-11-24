import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { of } from 'rxjs';
import {
    createDummies,
    dispatchMouseEvent,
    expectDom,
    fastTestSetup,
    getVisibleErrorAt,
    typeInElement,
} from '../../../../../test/helpers';
import { MockDialog, MockDialogRef } from '../../../../../test/mocks/browser';
import { VcsAccountDummy } from '../../../../core/dummies';
import { VcsFileChange } from '../../../../core/vcs';
import { GitService, WORKSPACE_DEFAULT_CONFIG, WorkspaceConfig } from '../../../shared';
import { Dialog, DialogRef } from '../../../ui/dialog';
import { MenuItem } from '../../../ui/menu';
import { UiModule } from '../../../ui/ui.module';
import { VcsFileChangeDummy } from '../../dummies';
import { VCS_ACCOUNT_DATABASE, VcsAccountDatabase, VcsAccountDatabaseProvider } from '../../vcs-account-database';
import { GithubAccountsDialogComponent, VcsRemoteModule } from '../../vcs-remote';
import { BaseVcsItemFactory, VCS_ITEM_MAKING_FACTORIES, VcsItemListManager, VcsViewModule } from '../../vcs-view';
import { CommittedAction } from '../../vcs.actions';
import { vcsReducerMap } from '../../vcs.reducer';
import { VcsStateWithRoot } from '../../vcs.state';
import { VcsCommitDialogData } from './vcs-commit-dialog-data';
import { VcsCommitDialogResult } from './vcs-commit-dialog-result';
import { VcsCommitDialogComponent } from './vcs-commit-dialog.component';
import Spy = jasmine.Spy;


describe('browser.vcs.vcsCommit.VcsCommitDialogComponent', () => {
    let fixture: ComponentFixture<VcsCommitDialogComponent>;
    let component: VcsCommitDialogComponent;

    let mockDialog: MockDialog;
    let mockDialogRef: MockDialogRef<VcsCommitDialogComponent,
        VcsCommitDialogData,
        VcsCommitDialogResult>;
    let listManager: VcsItemListManager;
    let accountDB: VcsAccountDatabase;
    let git: GitService;
    let store: Store<VcsStateWithRoot>;

    const workspaceConfig: WorkspaceConfig = {
        rootDirPath: '/test/workspace/',
    };

    const fileChangeDummy = new VcsFileChangeDummy();
    const accountDummy = new VcsAccountDummy();

    function initVcsItemWith(
        fileChanges: VcsFileChange[] = createDummies(fileChangeDummy, 10),
    ): VcsFileChange[] {
        component.data = { fileChanges };
        fixture.detectChanges();

        tick();
        fixture.detectChanges();

        listManager = component['itemListManager'] as VcsItemListManager;

        return fileChanges;
    }

    function ignoreAccountsGetting(): void {
        component['loadAccounts'] = jasmine.createSpy('private method');
    }

    const getAuthorSelectEl = (): HTMLElement =>
        fixture.debugElement.query(By.css('gd-select-menu#commit-author-select')).nativeElement as HTMLElement;

    const getSummaryFormFieldDe = (): DebugElement => fixture.debugElement.query(By.css('#commit-summary-form-field'));
    const getSummaryInputEl = (): HTMLInputElement =>
        fixture.debugElement.query(By.css('#commit-summary-input')).nativeElement as HTMLInputElement;

    const getSubmitButtonEl = (): HTMLButtonElement =>
        fixture.debugElement.query(
            By.css('.VcsCommitDialog__submitButton'),
        ).nativeElement as HTMLButtonElement;

    fastTestSetup();

    beforeAll(async () => {
        mockDialog = new MockDialog();
        mockDialogRef = new MockDialogRef(mockDialog, VcsCommitDialogComponent);

        await TestBed
            .configureTestingModule({
                imports: [
                    UiModule,
                    VcsViewModule,
                    VcsRemoteModule,
                    NoopAnimationsModule,
                    StoreModule.forRoot({
                        vcs: combineReducers(vcsReducerMap),
                    }),
                ],
                providers: [
                    {
                        provide: VCS_ITEM_MAKING_FACTORIES,
                        useFactory(factory: BaseVcsItemFactory) {
                            return [factory];
                        },
                        deps: [BaseVcsItemFactory],
                    },
                    { provide: DialogRef, useValue: mockDialogRef },
                    { provide: WORKSPACE_DEFAULT_CONFIG, useValue: workspaceConfig },
                    VcsAccountDatabaseProvider,
                ],
                declarations: [
                    VcsCommitDialogComponent,
                ],
            })
            // Override component to mock child dialog.
            .overrideComponent(VcsCommitDialogComponent, {
                set: {
                    providers: [{ provide: Dialog, useValue: mockDialog }],
                },
            })
            .compileComponents();
    });

    beforeEach(() => {
        accountDB = TestBed.get(VCS_ACCOUNT_DATABASE);
        git = TestBed.get(GitService);
        store = TestBed.get(Store);

        fixture = TestBed.createComponent(VcsCommitDialogComponent);
        component = fixture.componentInstance;
    });

    afterEach(async () => {
        await accountDB.accounts.clear();
    });

    describe('vcs item list', () => {
        beforeEach(() => {
            ignoreAccountsGetting();
        });

        it('should display vcs item list.', fakeAsync(() => {
            const fileChanges = initVcsItemWith();
            const itemListEl = fixture.debugElement.nativeElement as HTMLElement;

            expect(itemListEl.querySelectorAll('.VcsItemPane').length).toEqual(fileChanges.length);
        }));

        it('should all items are selected at first time.', fakeAsync(() => {
            initVcsItemWith();
            expect(listManager.areAllItemsSelected()).toBe(true);
        }));

        it('should display selected vcs item counts.', fakeAsync(() => {
            initVcsItemWith();

            const countEl = fixture.debugElement.query(
                By.css('.VcsCommitDialog__itemContainer > h2'),
            ).nativeElement as HTMLElement;

            expectDom(countEl).toContainText(`${listManager.getSelectedItems().length} items selected`);
        }));
    });

    describe('commit form', () => {
        it('should show required error when user not input summary.', fakeAsync(() => {
            ignoreAccountsGetting();
            initVcsItemWith();

            typeInElement('some_summary', getSummaryInputEl());
            typeInElement('', getSummaryInputEl());
            fixture.detectChanges();

            expect(getVisibleErrorAt(getSummaryFormFieldDe()).errorName).toEqual('required');
        }));

        it('should show maxlength error when user input summary more than 72 character.', fakeAsync(() => {
            ignoreAccountsGetting();
            initVcsItemWith();

            typeInElement(new Array(74).join('.'), getSummaryInputEl());
            fixture.detectChanges();

            expect(getVisibleErrorAt(getSummaryFormFieldDe()).errorName).toEqual('maxlength');
        }));

        it('should submit button disabled when author is not selected and '
            + 'summary is not input.', fakeAsync(() => {
            ignoreAccountsGetting();
            initVcsItemWith();

            // Nothing select or input.
            expectDom(getSubmitButtonEl()).toBeDisabled();

            // Select author.
            component.commitFormGroup.get('author').patchValue({ label: 'hello' } as MenuItem);
            fixture.detectChanges();

            expectDom(getSubmitButtonEl()).toBeDisabled();

            // Input summary.
            typeInElement('this_is_summary', getSummaryInputEl());
            fixture.detectChanges();

            expectDom(getSubmitButtonEl()).not.toBeDisabled();
        }));

        it('should get all authors from account database on ngOnInit.', fakeAsync(() => {
            const accounts = createDummies(accountDummy, 10);
            spyOn(accountDB, 'getAllAccounts').and.returnValue(Promise.resolve(accounts));

            // Expect to fetch accounts.
            component.data = { fileChanges: [] };
            fixture.detectChanges();

            flushMicrotasks();
            fixture.detectChanges();

            expect(component.authorMenuItems).toEqual(accounts.map(account => ({
                id: account.email,
                label: `${account.name} <${account.email}>`,
            } as MenuItem)));
        }));

        it('should commit button disabled when selected items count is 0.', fakeAsync(() => {
            initVcsItemWith();

            // Make form valid.
            component.commitFormGroup.patchValue({
                author: accountDummy.create(),
                summary: 'Summary',
            });
            fixture.detectChanges();

            (component['itemListManager'] as VcsItemListManager).deselectAllItems();
            fixture.detectChanges();

            // Yet still submit button is disabled.
            expectDom(getSubmitButtonEl()).toBeDisabled();
        }));

        it('should open github accounts dialog when click \'add author\' button in author select menu. After dialog '
            + 'closed, should reload all authors from account database.', fakeAsync(() => {
            const prevAccounts = createDummies(accountDummy, 5);
            spyOn(accountDB, 'getAllAccounts').and.returnValue(Promise.resolve(prevAccounts));

            component.data = { fileChanges: [] };
            fixture.detectChanges();

            flushMicrotasks();
            fixture.detectChanges();

            expect(component.authorMenuItems).toEqual(prevAccounts.map(account => ({
                id: account.email,
                label: `${account.name} <${account.email}>`,
            } as MenuItem)));

            // First, we should open menu...
            const menuTriggerEl = getAuthorSelectEl();
            dispatchMouseEvent(menuTriggerEl, 'mousedown');
            menuTriggerEl.click();
            tick();
            fixture.detectChanges();

            // Click add author button
            const addAuthorButtonEl = document.querySelector('#add-author-menu') as HTMLButtonElement;
            addAuthorButtonEl.click();
            tick(500);
            fixture.detectChanges();

            const githubAccountsDialogRef = mockDialog.getByComponent<GithubAccountsDialogComponent>(
                GithubAccountsDialogComponent,
            );
            expect(githubAccountsDialogRef).toBeDefined();

            const nextAccounts = [...prevAccounts, ...createDummies(accountDummy, 5)];
            (accountDB.getAllAccounts as Spy).and.returnValue(Promise.resolve(nextAccounts));

            githubAccountsDialogRef.close();
            flushMicrotasks();
            fixture.detectChanges();

            expect(component.authorMenuItems).toEqual(nextAccounts.map(account => ({
                id: account.email,
                label: `${account.name} <${account.email}>`,
            } as MenuItem)));
        }));
    });

    describe('action', () => {
        it('should commit and dispatch \'COMMITTED\' action. After that, '
            + 'close this dialog with result.', fakeAsync(() => {
            ignoreAccountsGetting();
            const fileChanges = initVcsItemWith();

            // Fill all form values.
            const author = accountDummy.create();
            component.commitFormGroup.patchValue({
                author,
                summary: 'Summary',
                description: 'Description',
            });
            fixture.detectChanges();

            const callback = jasmine.createSpy('dialog close spy');
            const subscription = mockDialogRef.afterClosed().subscribe(callback);
            spyOn(store, 'dispatch').and.callThrough();
            spyOn(git, 'commit').and.returnValue(of('commitId'));

            getSubmitButtonEl().click();
            flush();

            expect(git.commit).toHaveBeenCalledWith(
                workspaceConfig.rootDirPath,
                author,
                { summary: 'Summary', description: 'Description' },
                fileChanges.map(change => change.filePath),
            );
            expect(store.dispatch).toHaveBeenCalledWith(new CommittedAction({ commitId: 'commitId' }));

            expect(callback).toHaveBeenCalledWith({
                committed: true,
            } as VcsCommitDialogResult);
            subscription.unsubscribe();
        }));
    });
});
