import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { sampleWithout } from '../../../../test/helpers/sampling';
import { MockMenu } from '../../../../test/mocks/browser/mock-menu';
import { SortDirection } from '../../../libs/sorting';
import { ButtonToggleComponent } from '../../ui/button-toggle/button-toggle.component';
import { Menu } from '../../ui/menu/menu';
import { UIModule } from '../../ui/ui.module';
import {
    ChangeSortDirectionAction,
    ChangeSortOrderAction,
    ChangeViewModeAction,
} from '../shared/note-collection.actions';
import {
    createNoteCollectionInitialState,
    NoteCollectionSortBy,
    NoteCollectionViewModes,
} from '../shared/note-collection.state';
import { noteReducerMap } from '../shared/note.reducer';
import { NoteStateWithRoot } from '../shared/note.state';
import { NoteListSortingMenu } from './note-list-sorting-menu';
import { NoteListToolsComponent } from './note-list-tools.component';


describe('browser.note.NoteListToolsComponent', () => {
    let component: NoteListToolsComponent;
    let fixture: ComponentFixture<NoteListToolsComponent>;

    let store: Store<NoteStateWithRoot>;
    let mockMenu: MockMenu;

    beforeEach(async(() => {
        TestBed
            .configureTestingModule({
                imports: [
                    StoreModule.forRoot({
                        note: combineReducers(noteReducerMap),
                    }),
                    UIModule,
                ],
                providers: [
                    ...MockMenu.providersForTesting,
                    NoteListSortingMenu,
                ],
                declarations: [NoteListToolsComponent],
            })
            .compileComponents();
    }));

    beforeEach(() => {
        store = TestBed.get(Store);
        mockMenu = TestBed.get(Menu);

        spyOn(store, 'dispatch').and.callThrough();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(NoteListToolsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    const defaultViewMode = createNoteCollectionInitialState().viewMode;
    const getSortingMenuButtonEl = (): HTMLButtonElement =>
        fixture.debugElement.query(By.css('#sorting-menu-button')).nativeElement;

    const getViewModeToggle = (viewMode: NoteCollectionViewModes): ButtonToggleComponent => {
        const viewModeToggles = fixture.debugElement.queryAll(
            By.directive(ButtonToggleComponent),
        );

        return viewModeToggles.find(toggle =>
            toggle.componentInstance.value === viewMode,
        ).componentInstance;
    };

    it('should view mode is set to default value when component ' +
        'initialized', () => {
        expect(getViewModeToggle(defaultViewMode).checked).toBe(true);
    });

    it('should dispatch \'CHANGE_VIEW_MODE\' action and view mode ' +
        'is set to chosen value when click view mode toggle button.', fakeAsync(() => {
        const otherViewMode = sampleWithout<NoteCollectionViewModes>(
            NoteCollectionViewModes,
            [defaultViewMode],
        );
        const toggle = getViewModeToggle(otherViewMode);

        toggle._buttonEl.nativeElement.click();
        fixture.detectChanges();

        flush();

        expect(store.dispatch).toHaveBeenCalledWith(new ChangeViewModeAction({
            viewMode: otherViewMode,
        }));
        expect(toggle.checked).toBe(true);
    }));

    it('should dispatch \'CHANGE_SORT_ORDER\' action when ' +
        'click item from sorting menu.', fakeAsync(() => {
        getSortingMenuButtonEl().click();
        fixture.detectChanges();

        const item = mockMenu.template[2];
        mockMenu.menuRef.close(item);
        flush();

        expect(store.dispatch).toHaveBeenCalledWith(new ChangeSortOrderAction({
            sortBy: item.id as NoteCollectionSortBy,
        }));
    }));

    it('should dispatch \'CHANGE_SORT_DIRECTION\' action when ' +
        'click item from sorting menu.', fakeAsync(() => {
        getSortingMenuButtonEl().click();
        fixture.detectChanges();

        const item = mockMenu.template[5];
        mockMenu.menuRef.close(item);
        flush();

        expect(store.dispatch).toHaveBeenCalledWith(new ChangeSortDirectionAction({
            sortDirection: item.id as SortDirection,
        }));
    }));
});
