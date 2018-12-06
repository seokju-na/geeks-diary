import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { Subject } from 'rxjs';
import { expectDom, fastTestSetup } from '../../../../../test/helpers';
import { MenuEvent, MenuService, SharedModule } from '../../../shared';
import { UiModule } from '../../../ui/ui.module';
import { DeselectNoteAction, SelectNoteAction } from '../../note-collection';
import { NoteItemDummy } from '../../note-collection/dummies';
import { noteReducerMap } from '../../note.reducer';
import { NoteStateWithRoot } from '../../note.state';
import { NoteEditorViewModeMenu } from '../note-editor-view-mode-menu';
import { ChangeViewModeAction } from '../note-editor.actions';
import { NoteEditorViewModes } from '../note-editor.state';
import { NoteHeaderComponent } from './note-header.component';


describe('browser.note.noteEditor.NoteHeaderComponent', () => {
    let fixture: ComponentFixture<NoteHeaderComponent>;
    let component: NoteHeaderComponent;

    let store: Store<NoteStateWithRoot>;
    let editorViewModeMenu: NoteEditorViewModeMenu;
    let menu: MenuService;

    const menuStream = new Subject<MenuEvent>();

    const getSelectedNoteTitleEl = (): HTMLElement =>
        (fixture.debugElement.nativeElement as HTMLElement).querySelector('#selected-note-title');

    const getToolbarEl = (): HTMLElement =>
        (fixture.debugElement.nativeElement as HTMLElement).querySelector('.NoteHeader__toolbar');

    const getChangeEditorViewModeButtonEl = (): HTMLButtonElement =>
        fixture.debugElement.query(By.css('#note-change-editor-view-mode-button')).nativeElement as HTMLButtonElement;

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                imports: [
                    UiModule,
                    SharedModule,
                    StoreModule.forRoot({
                        note: combineReducers(noteReducerMap),
                    }),
                ],
                declarations: [
                    NoteHeaderComponent,
                ],
                providers: [
                    NoteEditorViewModeMenu,
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        store = TestBed.get(Store);
        editorViewModeMenu = TestBed.get(NoteEditorViewModeMenu);
        menu = TestBed.get(MenuService);

        spyOn(store, 'dispatch').and.callThrough();
        spyOn(menu, 'onMessage').and.callFake(() => menuStream.asObservable());

        fixture = TestBed.createComponent(NoteHeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('note title', () => {
        it('should note title not exists if current selected note is not exists.', () => {
            store.dispatch(new DeselectNoteAction());
            fixture.detectChanges();

            expect(getSelectedNoteTitleEl()).toBeNull();
        });

        it('should note title exists if current selected note is exists.', () => {
            const note = new NoteItemDummy().create();

            store.dispatch(new SelectNoteAction({ note }));
            fixture.detectChanges();

            expectDom(getSelectedNoteTitleEl()).toContainText(note.title);
        });

        it('should change note title to changed selected note\'s title.', () => {
            const noteDummy = new NoteItemDummy();
            const beforeNote = noteDummy.create();
            const afterNote = noteDummy.create();

            store.dispatch(new SelectNoteAction({ note: beforeNote }));
            fixture.detectChanges();

            let titleEl = getSelectedNoteTitleEl();

            expectDom(titleEl).toContainText(beforeNote.title);
            expectDom(titleEl).not.toContainText(afterNote.title);

            store.dispatch(new SelectNoteAction({ note: afterNote }));
            fixture.detectChanges();

            titleEl = getSelectedNoteTitleEl();

            expectDom(titleEl).not.toContainText(beforeNote.title);
            expectDom(titleEl).toContainText(afterNote.title);
        });
    });

    describe('toolbar', () => {
        it('should not exists if current selected note is not exists.', () => {
            store.dispatch(new DeselectNoteAction());
            fixture.detectChanges();

            expect(getToolbarEl()).toBeNull();
        });

        it('should exists if current selected note is exists.', () => {
            store.dispatch(new SelectNoteAction({ note: new NoteItemDummy().create() }));
            fixture.detectChanges();

            expect(getToolbarEl()).not.toBeNull();
        });
    });

    describe('editor view mode', () => {
        beforeEach(() => {
            store.dispatch(new SelectNoteAction({ note: new NoteItemDummy().create() }));
            fixture.detectChanges();
        });

        it('should open editor view mode menu when click change editor view mode button.', () => {
            spyOn(editorViewModeMenu, 'open');
            getChangeEditorViewModeButtonEl().click();

            expect(editorViewModeMenu.open).toHaveBeenCalled();
        });

        it('should dispatch \'CHANGE_VIEW_MODE\' action when menu event dispatched from main-process.', () => {
            menuStream.next(MenuEvent.CHANGE_EDITOR_VIEW_MODE_TO_SHOW_BOTH);
            expect(store.dispatch).toHaveBeenCalledWith(new ChangeViewModeAction({
                viewMode: NoteEditorViewModes.SHOW_BOTH,
            }));

            menuStream.next(MenuEvent.CHANGE_EDITOR_VIEW_MODE_TO_EDITOR_ONLY);
            expect(store.dispatch).toHaveBeenCalledWith(new ChangeViewModeAction({
                viewMode: NoteEditorViewModes.EDITOR_ONLY,
            }));

            menuStream.next(MenuEvent.CHANGE_EDITOR_VIEW_MODE_TO_PREVIEW_ONLY);
            expect(store.dispatch).toHaveBeenCalledWith(new ChangeViewModeAction({
                viewMode: NoteEditorViewModes.PREVIEW_ONLY,
            }));
        });
    });
});
