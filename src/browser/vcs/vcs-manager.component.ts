import {
    AfterViewInit,
    Component,
    ElementRef,
    Inject,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Observable, Subject, Subscription } from 'rxjs';
import { filter, finalize, switchMap, take, tap } from 'rxjs/operators';
import { ErrorWithMetadata } from '../../core/error-with-metadata';
import { GitSyncWithRemoteResult } from '../../core/git';
import { VcsCommitItem } from '../../core/vcs';
import { __DARWIN__ } from '../../libs/platform';
import { toPromise } from '../../libs/rx';
import { SettingsDialog } from '../settings';
import { ConfirmDialog } from '../shared/confirm-dialog';
import { Dialog } from '../ui/dialog';
import { TabControl } from '../ui/tabs/tab-control';
import { VcsCommitDialogComponent, VcsCommitDialogData, VcsCommitDialogResult } from './vcs-local';
import { VCS_SETTINGS_ID } from './vcs-settings';
import {
    VCS_ITEM_LIST_MANAGER,
    VcsItemListManager,
    VcsItemListManagerFactory,
    VcsSyncMessageBoxType,
} from './vcs-view';
import { LoadMoreCommitHistoryAction, SynchronizedAction, SynchronizedFailAction } from './vcs.actions';
import { VcsService } from './vcs.service';
import { VcsStateWithRoot } from './vcs.state';


@Component({
    selector: 'gd-vcs-manager',
    templateUrl: './vcs-manager.component.html',
    styleUrls: ['./vcs-manager.component.scss'],
})
export class VcsManagerComponent implements OnInit, OnDestroy, AfterViewInit {
    /** Control for tabs. */
    readonly tabControl = new TabControl([
        { name: 'Changes', value: 'gd-vcs-manager-changes' },
        { name: 'History', value: 'gd-vcs-manager-history' },
    ]);

    /** Form control for all select checkbox. */
    readonly allSelectCheckboxFormControl = new FormControl(false);
    allSelectCheckboxIndeterminate = false;

    commitItems: Observable<VcsCommitItem[]> = this.store.pipe(
        select(state => state.vcs.vcs.history),
    );

    @ViewChild('itemList') _itemList: ElementRef<HTMLElement>;

    syncResultMessageType: VcsSyncMessageBoxType;
    syncResultMessageDismissed = true;
    syncWorkspaceResult: GitSyncWithRemoteResult | null = null;
    syncWorkspaceErrorMessage: string;

    private allCommitsItemAreLoaded = false;
    private commitItemsAreLoading = false;
    private loadMoreCommitItems = new Subject<void>();
    private commitItemsFetchingSubscription = Subscription.EMPTY;

    /** Item list manager for changes tab. */
    private itemListManager: VcsItemListManager;

    private fileChangesSubscription = Subscription.EMPTY;
    private allSelectChangeSubscription = Subscription.EMPTY;
    private selectionChangeSubscription = Subscription.EMPTY;

    constructor(
        @Inject(VCS_ITEM_LIST_MANAGER) private itemListManagerFactory: VcsItemListManagerFactory,
        public _viewContainerRef: ViewContainerRef,
        private store: Store<VcsStateWithRoot>,
        private dialog: Dialog,
        private vcs: VcsService,
        private confirmDialog: ConfirmDialog,
        private settingsDialog: SettingsDialog,
    ) {
    }

    get selectedFileChangesCount(): number {
        if (this.itemListManager) {
            return this.itemListManager._selectedItems.size;
        } else {
            return 0;
        }
    }

    private _workspaceSynchronizing = false;

    get workspaceSynchronizing(): boolean {
        return this._workspaceSynchronizing;
    }

    ngOnInit(): void {
        this.fileChangesSubscription = this.store.pipe(
            select(state => state.vcs.vcs.fileChanges),
        ).subscribe((fileChanges) => {
            if (fileChanges.length === 0) {
                this.allSelectCheckboxFormControl.disable();
            } else {
                this.allSelectCheckboxFormControl.enable();
            }

            if (this.itemListManager && this.itemListManager.ready) {
                this.itemListManager.initWithFileChanges(fileChanges);
            }
        });

        // Subscribe to load more commit items stream.
        this.commitItemsFetchingSubscription = this.loadMoreCommitItems.asObservable()
            .pipe(
                /** Discard events while items are loading. */
                filter(() => !this.commitItemsAreLoading),
                tap(() => this.commitItemsAreLoading = true),
                switchMap(() => this.vcs.fetchMoreCommitHistory()),
            ).subscribe((items) => {
                this.allCommitsItemAreLoaded = items.length < this.vcs.commitHistoryFetchingSize;
                this.commitItemsAreLoading = false;

                this.store.dispatch(new LoadMoreCommitHistoryAction({
                    history: items,
                    allLoaded: this.allCommitsItemAreLoaded,
                }));
            });
    }

    ngOnDestroy(): void {
        if (this.itemListManager) {
            this.itemListManager.destroy();
        }

        this.fileChangesSubscription.unsubscribe();
        this.allSelectChangeSubscription.unsubscribe();
        this.selectionChangeSubscription.unsubscribe();
        this.commitItemsFetchingSubscription.unsubscribe();
    }

    ngAfterViewInit(): void {
        this.itemListManager = this.itemListManagerFactory(this._itemList.nativeElement, this._viewContainerRef);

        this.store.pipe(
            select(state => state.vcs.vcs.fileChanges),
            take(1),
        ).subscribe((fileChanges) => {
            // We should initialize components on next tick.
            // Otherwise we will get 'ExpressionChangedAfterItHasBeenCheckedError'.
            Promise
                .resolve(null)
                .then(() => this.itemListManager.initWithFileChanges(fileChanges));
        });

        // All select checkbox -> item list manager
        this.allSelectChangeSubscription = this.allSelectCheckboxFormControl.valueChanges
            .subscribe((checked) => {
                if (checked as boolean) {
                    this.itemListManager.selectAllItems();
                } else {
                    this.itemListManager.deselectAllItems();
                }
            });

        // Item list manger -> all select checkbox
        this.selectionChangeSubscription = this.itemListManager.selectionChanges
            .subscribe(() => {
                if (this.itemListManager.areAllItemsSelected()) {
                    this.allSelectCheckboxFormControl.setValue(true, { emitEvent: false });
                    this.allSelectCheckboxIndeterminate = false;
                } else {
                    this.allSelectCheckboxFormControl.setValue(false, { emitEvent: false });
                    this.allSelectCheckboxIndeterminate = !this.itemListManager.isEmptySelection();
                }
            });
    }

    openCommitDialog(): void {
        if (!this.itemListManager) {
            return;
        }

        const fileChanges = this.itemListManager
            .getSelectedItems()
            .reduce((all, item) => all.concat(...item._config.fileChanges), []);

        this.dialog.open<VcsCommitDialogComponent,
            VcsCommitDialogData,
            VcsCommitDialogResult>(
            VcsCommitDialogComponent,
            {
                width: '700px',
                maxHeight: '75vh',
                disableBackdropClickClose: true,
                data: { fileChanges },
            },
        );
    }

    loadMoreCommitHistory(): void {
        this.loadMoreCommitItems.next();
    }

    async syncWorkspace(): Promise<void> {
        if (this._workspaceSynchronizing) {
            return;
        }

        if (!(await this.vcs.canSyncRepository())) {
            const openSettings = await toPromise(this.confirmDialog.open({
                title: 'Repository settings required',
                body: 'To synchronize with remote repository, you must set up remote repository. '
                    + `Do you want to open the ${__DARWIN__ ? 'preferences' : 'settings'}?`,
                isAlert: false,
            }).afterClosed());

            if (openSettings) {
                this.settingsDialog.open({ initialSettingId: VCS_SETTINGS_ID });
            }

            return;
        }

        this.syncResultMessageDismissed = false;
        this.syncResultMessageType = null;
        this._workspaceSynchronizing = true;
        this.syncWorkspaceResult = null;
        this.syncWorkspaceErrorMessage = null;

        this.vcs
            .syncRepository()
            .pipe(finalize(() => this._workspaceSynchronizing = false))
            .subscribe(
                (result) => {
                    this.syncResultMessageType = 'success';
                    this.syncWorkspaceResult = result;
                    this.store.dispatch(new SynchronizedAction());
                },
                (error) => {
                    this.syncResultMessageType = 'error';
                    this.syncWorkspaceErrorMessage = (error as ErrorWithMetadata).errorDescription
                        ? (error as ErrorWithMetadata).errorDescription
                        : 'Unknown Error';
                    this.store.dispatch(new SynchronizedFailAction(error));
                },
            );
    }

    dismissSyncResultMessage(): void {
        this.syncResultMessageDismissed = true;
    }
}
