import { Component, ElementRef, NgModule, ViewChild, ViewContainerRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { createDummies, fastTestSetup } from '../../../../test/helpers';
import { UiModule } from '../../ui/ui.module';
import { VcsFileChangeDummy } from '../dummies';
import { vcsReducerMap } from '../vcs.reducer';
import { VcsStateWithRoot } from '../vcs.state';
import { BaseVcsItemFactory } from './base-vcs-item/base-vcs-item-factory';
import { BaseVcsItemComponent } from './base-vcs-item/base-vcs-item.component';
import { VcsItemRef, VcsItemUpdateCheckedEvent } from './vcs-item';
import {
    VCS_ITEM_LIST_MANAGER,
    VcsItemListManager,
    VcsItemListManagerFactory,
    VcsItemListManagerFactoryProvider,
} from './vcs-item-list-manager';
import { VCS_ITEM_MAKING_FACTORIES, VcsItemMaker } from './vcs-item-maker';


describe('browser.vcs.vcsView.VcsItemListManager', () => {
    let listManager: VcsItemListManager;
    let itemMaker: VcsItemMaker;

    let fixture: ComponentFixture<TestVcsItemListHostComponent>;
    let component: TestVcsItemListHostComponent;
    let store: Store<VcsStateWithRoot>;

    const fileChangeDummy = new VcsFileChangeDummy();

    const getItemList = (): BaseVcsItemComponent[] =>
        fixture.debugElement.queryAll(By.css('gd-base-vcs-item'))
            .map(de => de.componentInstance as BaseVcsItemComponent);

    const getPaneElList = (): NodeListOf<HTMLElement> =>
        component.host.nativeElement.querySelectorAll('.VcsItemPane');

    function ensureVcsItems(count: number = 10): VcsItemRef<any>[] {
        const fileChanges = createDummies(fileChangeDummy, count);
        return listManager.initWithFileChanges(fileChanges);
    }

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                imports: [
                    TestVcsItemListManagerModule,
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
                    VcsItemMaker,
                    VcsItemListManagerFactoryProvider,
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        const factory = TestBed.get(VCS_ITEM_LIST_MANAGER) as VcsItemListManagerFactory;
        store = TestBed.get(Store);
        itemMaker = TestBed.get(VcsItemMaker);

        fixture = TestBed.createComponent(TestVcsItemListHostComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        listManager = factory(component.host.nativeElement, component.viewContainerRef);
    });

    afterEach(() => {
        fixture.debugElement.queryAll(By.css('.VcsItemPane')).forEach((paneDe) => {
            (paneDe.nativeElement as HTMLElement).remove();
        });
    });

    describe('#initWithFileChanges', () => {
        it('should create vcs items.', () => {
            const fileChanges = createDummies(fileChangeDummy, 10);
            const refs = listManager.initWithFileChanges(fileChanges);

            fixture.detectChanges();

            expect(refs.length).toEqual(10);
            expect(getPaneElList().length).toEqual(10);
        });

        it('should keep previous selections when vcs items are changed.', () => {
            const prevFileChanges = createDummies(fileChangeDummy, 5);
            const prevRefs = listManager.initWithFileChanges(prevFileChanges);
            fixture.detectChanges();

            listManager.updateItemSelection(2, true);
            listManager.updateItemSelection(4, true);
            fixture.detectChanges();

            expect(listManager.getSelectedItems()).toEqual([prevRefs[2], prevRefs[4]]);

            const nextFileChanges = [...prevFileChanges, ...createDummies(fileChangeDummy, 5)];
            const nextRefs = listManager.initWithFileChanges(nextFileChanges);
            fixture.detectChanges();

            expect(listManager.getSelectedItems()).toEqual([nextRefs[2], nextRefs[4]]);
        });
    });

    describe('#selectAllItems', () => {
        beforeEach(() => {
            ensureVcsItems();
            fixture.detectChanges();
        });

        it('should select all items.', () => {
            listManager.selectAllItems();
            fixture.detectChanges();

            getItemList().forEach((item) => {
                expect(item.checked).toBe(true);
            });
        });
    });

    describe('#deselectAllItems', () => {
        beforeEach(() => {
            ensureVcsItems();
            fixture.detectChanges();
        });

        it('should deselect all items.', () => {
            listManager.deselectAllItems();
            fixture.detectChanges();

            getItemList().forEach((item) => {
                expect(item.checked).toBe(false);
            });
        });
    });

    describe('#areAllItemsSelected', () => {
        beforeEach(() => {
            ensureVcsItems();
            fixture.detectChanges();
        });

        it('should be \'true\' if all items are selected.', () => {
            listManager.selectAllItems();
            fixture.detectChanges();

            expect(listManager.areAllItemsSelected()).toBe(true);
        });
    });

    describe('#isEmptySelection', () => {
        beforeEach(() => {
            ensureVcsItems();
            fixture.detectChanges();
        });

        it('should be \'true\' if all items are selected.', () => {
            listManager.deselectAllItems();
            fixture.detectChanges();

            expect(listManager.isEmptySelection()).toBe(true);
        });
    });

    describe('#updateItemSelection', () => {
        let refs: VcsItemRef<BaseVcsItemComponent>[];

        beforeEach(() => {
            refs = ensureVcsItems();
            fixture.detectChanges();
        });

        it('should not throw \'TypeError\' if index of references is not exists.', () => {
            expect(() => listManager.updateItemSelection(10, true)).not.toThrowError();
        });

        it('on delete item selection.', () => {
            listManager._selectedItems.add(refs[5].id);

            // Update item selection.
            listManager.updateItemSelection(5, false);

            expect(listManager._selectedItems.has(refs[5].id)).toBe(false);
            expect(listManager.getSelectedItems()).toEqual([]);
        });

        it('on add item selection.', () => {
            listManager.updateItemSelection(3, true);

            expect(listManager._selectedItems.has(refs[3].id)).toBe(true);
            expect(listManager.getSelectedItems()).toEqual([refs[3]]);
        });
    });

    describe('handle events via references', () => {
        let refs: VcsItemRef<any>[];

        beforeEach(() => {
            refs = ensureVcsItems();
            fixture.detectChanges();
        });

        it('should call \'updateItemSelection\' when \'UPDATE_CHECKED\' event called.', () => {
            spyOn(listManager, 'updateItemSelection');

            refs[3].events.next(new VcsItemUpdateCheckedEvent(refs[3], { checked: true }));
            expect(listManager.updateItemSelection).toHaveBeenCalledWith(3, true);

            refs[7].events.next(new VcsItemUpdateCheckedEvent(refs[7], { checked: false }));
            expect(listManager.updateItemSelection).toHaveBeenCalledWith(7, false);
        });
    });
});


@Component({
    template: `
        <div #host></div>
    `,
})
class TestVcsItemListHostComponent {
    @ViewChild('host') host: ElementRef<HTMLElement>;

    constructor(public viewContainerRef: ViewContainerRef) {
    }
}


@NgModule({
    imports: [
        UiModule,
    ],
    declarations: [
        BaseVcsItemComponent,
        TestVcsItemListHostComponent,
    ],
    entryComponents: [
        BaseVcsItemComponent,
    ],
    providers: [
        BaseVcsItemFactory,
    ],
    exports: [
        BaseVcsItemComponent,
        TestVcsItemListHostComponent,
    ],
})
class TestVcsItemListManagerModule {
}
