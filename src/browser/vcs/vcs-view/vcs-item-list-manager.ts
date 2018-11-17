import { FocusKeyManager } from '@angular/cdk/a11y';
import { ComponentPortal, DomPortalOutlet, PortalInjector } from '@angular/cdk/portal';
import { ApplicationRef, ComponentFactoryResolver, Injectable, Injector, ViewContainerRef } from '@angular/core';
import { merge, Observable, Subject, Subscription } from 'rxjs';
import { VcsFileChange } from '../../../core/vcs';
import { VcsItem, VcsItemConfig, VcsItemEvent, VcsItemEventNames, VcsItemRef } from './vcs-item';
import { VcsItemMaker } from './vcs-item-maker';


let uniqueId = 0;


@Injectable()
export class VcsItemListManager {
    _itemRefs: VcsItemRef<any>[] = [];
    _keyManager: FocusKeyManager<VcsItem> | null = null;
    _selectedItems = new Set<string>();

    private containerEl: HTMLElement;
    private viewContainerRef: ViewContainerRef;
    private itemRefEventsSubscription = Subscription.EMPTY;

    private selectionChangeStream = new Subject<void>();

    constructor(
        private itemMaker: VcsItemMaker,
        private injector: Injector,
        private componentFactoryResolver: ComponentFactoryResolver,
        private appRef: ApplicationRef,
    ) {
    }

    get ready(): boolean {
        return !!this.containerEl && !!this.viewContainerRef;
    }

    get selectionChanges(): Observable<void> {
        return this.selectionChangeStream.asObservable();
    }

    /** Return all selected item references. */
    getSelectedItems(): VcsItemRef<any>[] {
        const refs: VcsItemRef<any>[] = [];

        for (const id of this._selectedItems.values()) {
            const ref = this._itemRefs.find(_ref => _ref.id === id);

            if (ref) {
                refs.push(ref);
            }
        }

        return refs;
    }

    setContainerElement(containerEl: HTMLElement): this {
        this.containerEl = containerEl;
        return this;
    }

    setViewContainerRef(viewContainerRef: ViewContainerRef): this {
        this.viewContainerRef = viewContainerRef;
        return this;
    }

    initWithFileChanges(fileChanges: VcsFileChange[]): VcsItemRef<any>[] {
        // Preserve previous selections.
        const previousSelections: string[] = [];

        for (const itemId of this._selectedItems.values()) {
            previousSelections.push(itemId);
        }

        this._selectedItems.clear();

        // Remove previous item references.
        while (this._itemRefs.length) {
            this.destroyItemAt(0);
            this._itemRefs.shift();
        }

        // Add all vcs items which made from all of factories.
        const refs = this.itemMaker.create(fileChanges);

        previousSelections.forEach((id) => {
            const index = refs.findIndex(ref => ref.id === id);

            if (index !== -1) {
                refs[index]._config.checked = true;
                this._selectedItems.add(id);
            }
        });

        refs.forEach((ref) => {
            this.attachViewItemComponent(this.appendPaneElement(), ref);
            this._itemRefs.push(ref);
        });

        this._updateKeyManager();
        this.updateItemRefEventsSubscription();

        return this._itemRefs;
    }

    _updateKeyManager(): void {
        this._keyManager = new FocusKeyManager(this._itemRefs.map(ref => ref.componentInstance as VcsItem));
    }

    selectAllItems(): void {
        this._itemRefs.forEach((itemRef) => {
            (itemRef.componentInstance as VcsItem).select(false);
            this._selectedItems.add(itemRef.id);
        });
    }

    deselectAllItems(): void {
        this._itemRefs.forEach((itemRef) => {
            (itemRef.componentInstance as VcsItem).deselect(false);
        });

        this._selectedItems.clear();
    }

    updateItemSelection(index: number, selected: boolean): void {
        const ref = this._itemRefs[index];

        if (!ref) {
            return;
        }

        const id = ref.id;
        const hasSelected = this._selectedItems.has(id);

        if (hasSelected && !selected) {
            this._selectedItems.delete(id);
            this.selectionChangeStream.next();
        } else if (!hasSelected && selected) {
            this._selectedItems.add(id);
            this.selectionChangeStream.next();
        }
    }

    areAllItemsSelected(): boolean {
        return this._selectedItems.size === this._itemRefs.length;
    }

    isEmptySelection(): boolean {
        return this._selectedItems.size === 0;
    }

    handleItemEvent(event: VcsItemEvent): void {
        const index = this._itemRefs.findIndex(ref => ref.id === event.source.id);

        switch (event.name) {
            case VcsItemEventNames.UPDATE_CHECKED:
                this._keyManager.setActiveItem(index);
                this.updateItemSelection(index, event.payload.checked);
                break;
        }
    }

    destroy(): void {
        this._keyManager = null;
        this._selectedItems.clear();
        this.containerEl = null;
        this.viewContainerRef = null;
        this._itemRefs = [];

        if (this.itemRefEventsSubscription) {
            this.itemRefEventsSubscription.unsubscribe();
        }

        this.selectionChangeStream.complete();
    }

    private appendPaneElement(): HTMLElement {
        const pane = document.createElement('div');

        pane.id = `gd-vcs-item-pane-${uniqueId++}`;
        pane.classList.add('VcsItemPane');

        this.containerEl.appendChild(pane);

        return pane;
    }

    private attachViewItemComponent(pane: HTMLElement, ref: VcsItemRef<any>): void {
        const portal = new DomPortalOutlet(pane, this.componentFactoryResolver, this.appRef, this.injector);
        const injector = this.createInjector(ref);
        const componentRef = portal.attachComponentPortal(
            new ComponentPortal<VcsItem>(ref.component, this.viewContainerRef || undefined, injector),
        );

        ref.panePortal = portal;
        ref.paneElementId = pane.id;
        ref.componentInstance = componentRef.instance;
    }

    private destroyItemAt(index: number): void {
        const itemRef = this._itemRefs[index];

        if (!itemRef) {
            return;
        }

        itemRef.destroy();
        itemRef.panePortal.dispose();

        const paneElementId = itemRef.paneElementId;

        if (this.containerEl) {
            const paneEl = this.containerEl.querySelector(`#${paneElementId}`);

            if (paneEl) {
                this.containerEl.removeChild(paneEl);
            }
        }
    }

    private createInjector(ref: VcsItemRef<any>): PortalInjector {
        const injectionTokens = new WeakMap<any, any>([
            [VcsItemRef, ref],
            [VcsItemConfig, ref._config],
        ]);

        return new PortalInjector(this.injector, injectionTokens);
    }

    private updateItemRefEventsSubscription(): void {
        if (this.itemRefEventsSubscription) {
            this.itemRefEventsSubscription.unsubscribe();
        }

        this.itemRefEventsSubscription = merge(
            ...this._itemRefs.map(itemRef => itemRef.events.asObservable()),
        ).subscribe(event => this.handleItemEvent(event));
    }
}
