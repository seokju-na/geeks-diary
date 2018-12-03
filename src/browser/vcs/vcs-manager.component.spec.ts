import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { of } from 'rxjs';
import { MockDialog } from '../../../test/mocks/browser';
import { Dialog } from '../ui/dialog';
import { UiModule } from '../ui/ui.module';
import { VcsCommitDialogComponent, VcsCommitDialogData, VcsCommitDialogResult, VcsLocalModule } from './vcs-local';
import { BaseVcsItemFactory, VCS_ITEM_MAKING_FACTORIES, VcsItem, VcsItemListManager, VcsViewModule } from './vcs-view';
import { createDummies, createFakeEvent, fastTestSetup } from '../../../test/helpers';
import { VcsFileChange } from '../../core/vcs';
import { CheckboxComponent } from '../ui/checkbox';
import { VcsFileChangeDummy } from './dummies';
import { SynchronizedAction, UpdateFileChangesAction } from './vcs.actions';
import { vcsReducerMap } from './vcs.reducer';
import { VcsService } from './vcs.service';
import { VcsStateWithRoot } from './vcs.state';
import { VcsManagerComponent } from './vcs-manager.component';
import Spy = jasmine.Spy;


describe('browser.vcs.VcsManagerComponent', () => {
    let fixture: ComponentFixture<VcsManagerComponent>;
    let component: VcsManagerComponent;

    let listManager: VcsItemListManager;
    let store: Store<VcsStateWithRoot>;
    let mockDialog: MockDialog;
    let vcs: VcsService;

    const fileChangeDummy = new VcsFileChangeDummy();

    const getAllSelectCheckbox = (): CheckboxComponent =>
        fixture.debugElement.query(
            By.css('.VcsManager__actionbar > gd-checkbox'),
        ).componentInstance as CheckboxComponent;

    const getCommitButtonEl = (): HTMLButtonElement =>
        fixture.debugElement.query(By.css('.VcsManager__commitButton')).nativeElement as HTMLButtonElement;

    const getSyncWorkspaceButtonEl = (): HTMLButtonElement =>
        fixture.debugElement.query(By.css('#vcs-sync-workspace-button')).nativeElement as HTMLButtonElement;

    /** Initialize vcs items with given file changes. */
    function initVcsItemsWith(
        fileChanges: VcsFileChange[] = createDummies(fileChangeDummy, 5),
    ): VcsFileChange[] {
        store.dispatch(new UpdateFileChangesAction({ fileChanges }));
        fixture.detectChanges();

        // On next tick.
        flush();
        fixture.detectChanges();

        listManager = component['itemListManager'];

        return fileChanges;
    }

    fastTestSetup();

    beforeAll(async () => {
        vcs = jasmine.createSpyObj('vcs', [
            'fetchMoreCommitHistory',
            'commitHistoryFetchingSize',
            'canSyncRepository',
            'syncRepository',
        ]);

        await TestBed
            .configureTestingModule({
                imports: [
                    UiModule,
                    VcsViewModule,
                    VcsLocalModule,
                    StoreModule.forRoot({
                        vcs: combineReducers(vcsReducerMap),
                    }),
                    ...MockDialog.imports(),
                ],
                providers: [
                    {
                        provide: VCS_ITEM_MAKING_FACTORIES,
                        useFactory(baseVcsItemFactory: BaseVcsItemFactory) {
                            return [baseVcsItemFactory];
                        },
                        deps: [BaseVcsItemFactory],
                    },
                    ...MockDialog.providers(),
                    { provide: VcsService, useValue: vcs },
                ],
                declarations: [
                    VcsManagerComponent,
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        store = TestBed.get(Store);
        mockDialog = TestBed.get(Dialog);

        spyOn(store, 'dispatch').and.callThrough();

        fixture = TestBed.createComponent(VcsManagerComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        mockDialog.closeAll();
    });

    describe('ngOnInit', () => {
        it('should initialize vcs item list whenever file changes are updated.', () => {
            fixture.detectChanges();
            listManager = component['itemListManager'];

            spyOn(listManager, 'initWithFileChanges').and.callThrough();

            const beforeFileChanges = createDummies(fileChangeDummy, 5);
            store.dispatch(new UpdateFileChangesAction({ fileChanges: beforeFileChanges }));
            fixture.detectChanges();

            expect(listManager.initWithFileChanges).toHaveBeenCalledWith(beforeFileChanges);

            const afterFileChanges = createDummies(fileChangeDummy, 7);
            store.dispatch(new UpdateFileChangesAction({ fileChanges: afterFileChanges }));
            fixture.detectChanges();

            expect(listManager.initWithFileChanges).toHaveBeenCalledWith(afterFileChanges);
        });
    });

    describe('Changes Tab - empty state', () => {
        it('should display empty state when vcs items in list are empty.', fakeAsync(() => {
            initVcsItemsWith([]);
            expect(fixture.debugElement.query(By.css('.VcsManager__itemListEmptyState'))).not.toBeNull();
        }));
    });

    describe('Changes Tab - actionbar selection toggle', () => {
        it('should all select checkbox is disabled when file changes are empty.', fakeAsync(() => {
            initVcsItemsWith([]);
            expect(component.allSelectCheckboxFormControl.disabled).toBe(true);
        }));

        it('should all select checkbox indeterminate when '
            + 'not all items selected or deselected.', fakeAsync(() => {
            initVcsItemsWith();

            // empty selection
            listManager._selectedItems.clear();
            fixture.detectChanges();
            expect(getAllSelectCheckbox().indeterminate).toBe(false);

            // indeterminate
            (listManager._itemRefs[0].componentInstance as VcsItem).select(true);
            (listManager._itemRefs[2].componentInstance as VcsItem).select(true);
            fixture.detectChanges();

            expect(getAllSelectCheckbox().indeterminate).toBe(true);

            // all selected.
            listManager._itemRefs.forEach(ref => (ref.componentInstance as VcsItem).select(true));
            fixture.detectChanges();

            expect(getAllSelectCheckbox().indeterminate).toBe(false);
        }));

        it('should select all items when toggles all select checkbox values to \'true\'.', fakeAsync(() => {
            initVcsItemsWith();

            // empty -> all selected
            listManager._itemRefs.forEach(ref => (ref.componentInstance as VcsItem).deselect(true));
            fixture.detectChanges();

            getAllSelectCheckbox()._onInputClick(createFakeEvent('click'));
            fixture.detectChanges();

            expect(component.allSelectCheckboxFormControl.value as boolean).toBe(true);
            expect(listManager.areAllItemsSelected()).toBe(true);
        }));

        it('should deselect all items when toggles all select checkbox if all items are selected.', fakeAsync(() => {
            initVcsItemsWith();

            // select all items.
            listManager._itemRefs.forEach(ref => (ref.componentInstance as VcsItem).select(true));
            fixture.detectChanges();

            getAllSelectCheckbox()._onInputClick(createFakeEvent('click'));
            fixture.detectChanges();

            expect(component.allSelectCheckboxFormControl.value as boolean).toBe(false);
            expect(listManager.isEmptySelection()).toBe(true);
        }));
    });

    describe('Changes Tab - commit', () => {
        it('should open commit dialog with selected file changes.', fakeAsync(() => {
            const fileChanges = initVcsItemsWith();

            // select all items.
            listManager._itemRefs.forEach(ref => (ref.componentInstance as VcsItem).select(true));
            fixture.detectChanges();

            getCommitButtonEl().click();

            const commitDialogRef = mockDialog.getByComponent<VcsCommitDialogComponent,
                VcsCommitDialogData,
                VcsCommitDialogResult>(
                VcsCommitDialogComponent,
            );

            expect(commitDialogRef).toBeDefined();
            expect(commitDialogRef.config.disableBackdropClickClose).toBe(true);
            expect(commitDialogRef.config.data.fileChanges).toEqual(fileChanges);
        }));
    });

    describe('History Tab', () => {
        // TODO(@seoju-na): ...
    });

    describe('Sync Workspace', () => {
        it('should dispatch \'SYNCHRONIZED\' action after sync repository completes, '
            + 'when use click sync button.', fakeAsync(() => {
            (vcs.canSyncRepository as Spy).and.returnValue(Promise.resolve(true));
            (vcs.syncRepository as Spy).and.returnValue(of(null));

            getSyncWorkspaceButtonEl().click();
            flush();

            expect(store.dispatch).toHaveBeenCalledWith(new SynchronizedAction());
        }));
    });
});
