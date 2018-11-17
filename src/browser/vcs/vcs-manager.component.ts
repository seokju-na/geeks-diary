import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { TabControl } from '../ui/tabs/tab-control';
import { VcsItemListManager } from './vcs-view';
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

    @ViewChild('itemList') _itemList: ElementRef<HTMLElement>;

    private fileChangesSubscription = Subscription.EMPTY;
    private allSelectChangeSubscription = Subscription.EMPTY;
    private selectionChangeSubscription = Subscription.EMPTY;

    constructor(
        private itemListManager: VcsItemListManager,
        public _viewContainerRef: ViewContainerRef,
        private store: Store<VcsStateWithRoot>,
    ) {
    }

    get selectedFileChangesCount(): number {
        return this.itemListManager._selectedItems.size;
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

            if (this.itemListManager.ready) {
                this.itemListManager.initWithFileChanges(fileChanges);
            }
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

    ngOnDestroy(): void {
        this.itemListManager.destroy();
        this.fileChangesSubscription.unsubscribe();
        this.allSelectChangeSubscription.unsubscribe();
        this.selectionChangeSubscription.unsubscribe();
    }

    ngAfterViewInit(): void {
        this.itemListManager
            .setViewContainerRef(this._viewContainerRef)
            .setContainerElement(this._itemList.nativeElement);

        this.store.pipe(
            select(state => state.vcs.vcs.fileChanges),
            take(1),
        ).subscribe((fileChanges) => {
            // We should initialize components on next tick.
            // Otherwise we will get 'ExpressionChangedAfterItHasBeenCheckedError'.
            Promise.resolve(null).then(() => {
                this.itemListManager.initWithFileChanges(fileChanges);
            });
        });
    }
}
