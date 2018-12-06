import { TestBed } from '@angular/core/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { MenuItemConstructorOptions } from 'electron';
import { of } from 'rxjs';
import { fastTestSetup } from '../../../../test/helpers';
import { SharedModule } from '../../shared';
import { NativeMenu } from '../../ui/menu';
import { noteReducerMap } from '../note.reducer';
import { NoteStateWithRoot } from '../note.state';
import { NoteEditorViewModeMenu } from './note-editor-view-mode-menu';
import { ChangeViewModeAction } from './note-editor.actions';
import { NoteEditorViewModes } from './note-editor.state';


describe('browser.note.noteEditor.NoteEditorViewModeMenu', () => {
    let editorViewModeMenu: NoteEditorViewModeMenu;
    let store: Store<NoteStateWithRoot>;
    let nativeMenu: NativeMenu;

    fastTestSetup();

    beforeAll(() => {
        TestBed.configureTestingModule({
            imports: [
                SharedModule,
                StoreModule.forRoot({
                    note: combineReducers(noteReducerMap),
                }),
            ],
            providers: [
                NoteEditorViewModeMenu,
            ],
        });
    });

    beforeEach(() => {
        editorViewModeMenu = TestBed.get(NoteEditorViewModeMenu);
        store = TestBed.get(Store);
        nativeMenu = TestBed.get(NativeMenu);

        spyOn(store, 'dispatch').and.callThrough();
    });

    it('should open menu with template', () => {
        store.dispatch(new ChangeViewModeAction({ viewMode: NoteEditorViewModes.PREVIEW_ONLY }));

        spyOn(nativeMenu, 'open').and.returnValue({
            afterClosed: () => of(null),
        });

        editorViewModeMenu.open();

        const template =
            (nativeMenu.open as jasmine.Spy).calls.mostRecent().args[0] as MenuItemConstructorOptions[];

        expect(template[0].id).toEqual(NoteEditorViewModes.EDITOR_ONLY);
        expect(template[0].checked).toBe(false);
        expect(template[1].id).toEqual(NoteEditorViewModes.PREVIEW_ONLY);
        expect(template[1].checked).toBe(true);
        expect(template[2].id).toEqual(NoteEditorViewModes.SHOW_BOTH);
        expect(template[2].checked).toBe(false);
    });

    it('should dispatch \'CHANGE_VIEW_MODE\' action when click menu item.', () => {
        store.dispatch(new ChangeViewModeAction({ viewMode: NoteEditorViewModes.SHOW_BOTH }));

        spyOn(nativeMenu, 'open').and.returnValue({
            afterClosed: () => of({ id: NoteEditorViewModes.EDITOR_ONLY }),
        });

        editorViewModeMenu.open();
        expect(store.dispatch).toHaveBeenCalledWith(new ChangeViewModeAction({
            viewMode: NoteEditorViewModes.EDITOR_ONLY,
        }));
    });
});
