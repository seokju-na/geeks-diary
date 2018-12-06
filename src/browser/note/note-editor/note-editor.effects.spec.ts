import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action, combineReducers, StoreModule } from '@ngrx/store';
import { ReplaySubject } from 'rxjs';
import { fastTestSetup } from '../../../../test/helpers';
import { MenuService, SharedModule } from '../../shared';
import { SelectNoteAction } from '../note-collection';
import { NoteItemDummy } from '../note-collection/dummies';
import { noteReducerMap } from '../note.reducer';
import { NoteContentDummy } from './dummies';
import { ChangeViewModeAction, LoadNoteContentAction, LoadNoteContentCompleteAction } from './note-editor.actions';
import { NoteEditorEffects } from './note-editor.effects';
import { NoteEditorViewModes } from './note-editor.state';
import { NoteSnippetListManager } from './note-snippet-list-manager';


describe('browser.note.noteEditor.NoteEditorEffects', () => {
    let effects: NoteEditorEffects;

    let actions: ReplaySubject<Action>;
    let snippetListManager: NoteSnippetListManager;
    let menu: MenuService;

    const noteItemDummy = new NoteItemDummy();
    const noteContentDummy = new NoteContentDummy();

    fastTestSetup();

    beforeAll(() => {
        actions = new ReplaySubject<Action>(1);
        snippetListManager = jasmine.createSpyObj('snippetListManager', [
            'removeAllSnippets',
            'addAllSnippetsFromContent',
        ]);

        TestBed
            .configureTestingModule({
                imports: [
                    SharedModule,
                    StoreModule.forRoot({
                        note: combineReducers(noteReducerMap),
                    }),
                ],
                providers: [
                    { provide: NoteSnippetListManager, useValue: snippetListManager },
                    NoteEditorEffects,
                    provideMockActions(() => actions),
                ],
            });
    });

    beforeEach(() => {
        effects = TestBed.get(NoteEditorEffects);
        menu = TestBed.get(MenuService);
    });

    describe('loadNoteContentWhenNoteSelected', () => {
        it('should return \'LOAD_NOTE_CONTENT\' action.', () => {
            const callback = jasmine.createSpy('callback');
            const subscription = effects.loadNoteContentWhenNoteSelected.subscribe(callback);

            const note = noteItemDummy.create();

            actions.next(new SelectNoteAction({ note }));

            expect(callback).toHaveBeenCalledWith(new LoadNoteContentAction({ note: note }));
            subscription.unsubscribe();
        });
    });

    describe('afterNoteContentLoaded', () => {
        it('should call \'removeAllSnippets\' and \'addAllSnippetsFromContent\' from note snippet '
            + 'list manager for side effects.', () => {
            const callback = jasmine.createSpy('callback');
            const subscription = effects.afterNoteContentLoaded.subscribe(callback);

            const note = noteItemDummy.create();
            const content = noteContentDummy.createFromNote(note);

            actions.next(new LoadNoteContentCompleteAction({ note, content }));

            expect(snippetListManager.removeAllSnippets).toHaveBeenCalled();
            expect(snippetListManager.addAllSnippetsFromContent).toHaveBeenCalledWith(content);

            subscription.unsubscribe();
        });
    });

    describe('updateNoteViewMenuState', () => {
        it('should call menu \'updateNoteEditorViewMenuState\'.', () => {
            const callback = jasmine.createSpy('callback');
            const subscription = effects.updateNoteViewMenuState.subscribe(callback);

            spyOn(menu, 'updateNoteEditorViewMenuState');

            actions.next(new ChangeViewModeAction({ viewMode: NoteEditorViewModes.SHOW_BOTH }));
            expect(menu.updateNoteEditorViewMenuState).toHaveBeenCalledWith('note-view-show-both');

            actions.next(new ChangeViewModeAction({ viewMode: NoteEditorViewModes.EDITOR_ONLY }));
            expect(menu.updateNoteEditorViewMenuState).toHaveBeenCalledWith('note-view-editor-only');

            actions.next(new ChangeViewModeAction({ viewMode: NoteEditorViewModes.PREVIEW_ONLY }));
            expect(menu.updateNoteEditorViewMenuState).toHaveBeenCalledWith('note-view-preview-only');

            subscription.unsubscribe();
        });
    });
});
