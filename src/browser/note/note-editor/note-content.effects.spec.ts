import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action, combineReducers, Store, StoreModule } from '@ngrx/store';
import { of, ReplaySubject, Subject } from 'rxjs';
import { fastTestSetup } from '../../../../test/helpers';
import { Note } from '../../../core/note';
import {
    createNoteCollectionInitialState,
    noteCollectionReducer,
    NoteItem,
    SelectNoteAction,
} from '../note-collection';
import { NoteDummy, NoteItemDummy } from '../note-collection/dummies';
import { noteReducerMap } from '../note.reducer';
import { NoteState, NoteStateWithRoot } from '../note.state';
import { NoteContentDummy, NoteSnippetContentDummy } from './dummies';
import {
    NOTE_EDITOR_LOAD_NOTE_CONTENT_THROTTLE,
    NOTE_EDITOR_RESIZE_THROTTLE_TIME,
    NOTE_EDITOR_SAVE_NOTE_CONTENT_THROTTLE_TIME,
    NoteContentEffects,
} from './note-content.effects';
import { NoteContent } from './note-content.model';
import {
    AppendSnippetAction,
    CancelLoadNoteContentAction,
    ChangeViewModeAction,
    LoadNoteContentAction,
    LoadNoteContentCompleteAction,
    SaveNoteContentCompleteAction,
} from './note-editor.actions';
import { noteEditorReducer } from './note-editor.reducer';
import { NoteEditorService } from './note-editor.service';
import { createNoteEditorInitialState, NoteEditorViewModes } from './note-editor.state';
import { NoteSnippetListManager } from './note-snippet-list-manager';


describe('browser.note.noteEditor.NoteContentEffects', () => {
    let contentEffects: NoteContentEffects;

    let actions: ReplaySubject<Action>;
    let noteEditor: NoteEditorService;
    let store: Store<NoteStateWithRoot>;
    let listManager: NoteSnippetListManager;

    const noteDummy = new NoteDummy();
    const noteItemDummy = new NoteItemDummy();
    const noteContentDummy = new NoteContentDummy();

    fastTestSetup();

    beforeAll(() => {
        actions = new ReplaySubject<Action>(1);
        noteEditor = jasmine.createSpyObj('editor', [
            'loadNoteContent',
            'saveNote',
        ]);
        listManager = jasmine.createSpyObj('listManager', [
            'resizeSnippets',
        ]);

        TestBed
            .configureTestingModule({
                imports: [
                    StoreModule.forRoot({
                        note: combineReducers(noteReducerMap),
                    }),
                ],
                providers: [
                    { provide: NoteEditorService, useValue: noteEditor },
                    { provide: NoteSnippetListManager, useValue: listManager },
                    NoteContentEffects,
                    provideMockActions(() => actions),
                ],
            });
    });

    beforeEach(() => {
        contentEffects = TestBed.get(NoteContentEffects);
        store = TestBed.get(Store);
    });

    describe('load', () => {
        let note: Note;
        let noteItem: NoteItem;
        let content: NoteContent;

        beforeEach(() => {
            note = noteDummy.create();
            noteItem = noteItemDummy.createFromNote(note);
            content = noteContentDummy.createFromNote(note);
        });

        it('should throttling action.', fakeAsync(() => {
            const callback = jasmine.createSpy('load callback');
            const subscription = contentEffects.load.subscribe(callback);

            actions.next(new LoadNoteContentAction({ note: noteItem }));

            // Unsubscribe observable before throttle completes.
            tick(NOTE_EDITOR_LOAD_NOTE_CONTENT_THROTTLE - 100);
            subscription.unsubscribe();

            expect(callback).not.toHaveBeenCalled();
        }));

        it('should return \'LOAD_NOTE_CONTENT_COMPLETE\' action, '
            + 'with the note content, when success.', fakeAsync(() => {
            (noteEditor.loadNoteContent as jasmine.Spy).and.returnValue(of(content));

            const callback = jasmine.createSpy('load callback');
            const subscription = contentEffects.load.subscribe(callback);

            actions.next(new LoadNoteContentAction({ note: noteItem }));
            tick(NOTE_EDITOR_LOAD_NOTE_CONTENT_THROTTLE);

            expect(callback).toHaveBeenCalledWith(new LoadNoteContentCompleteAction({
                note: noteItem,
                content,
            }));
            subscription.unsubscribe();
        }));

        it('should not return \'LOAD_NOTE_CONTENT_COMPLETE\' action, '
            + 'if \'CANCEL_LOAD_NOTE_CONTENT\' action dispatched while loading the note content.', fakeAsync(() => {
            const loadNoteContentEvents = new Subject<NoteContent>();
            (noteEditor.loadNoteContent as jasmine.Spy).and.returnValue(loadNoteContentEvents.asObservable());

            const callback = jasmine.createSpy('load callback');
            const subscription = contentEffects.load.subscribe(callback);

            actions.next(new LoadNoteContentAction({ note: noteItem }));
            tick(NOTE_EDITOR_LOAD_NOTE_CONTENT_THROTTLE);

            // Dispatch 'CANCEL_LOAD_NOTE_CONTENT' action.
            actions.next(new CancelLoadNoteContentAction());
            loadNoteContentEvents.next(content);
            flush();

            expect(callback).not.toHaveBeenCalled();
            subscription.unsubscribe();
        }));
    });

    describe('saveCurrentNote', () => {
        let note: Note;
        let noteItem: NoteItem;
        let content: NoteContent;
        let state: NoteState;

        beforeEach(() => {
            state = {
                collection: createNoteCollectionInitialState(),
                editor: createNoteEditorInitialState(),
            };

            note = noteDummy.create();
            noteItem = noteItemDummy.createFromNote(note);
            content = noteContentDummy.createFromNote(note);

            // Make state
            const selectNoteAction = new SelectNoteAction({ note: noteItem });
            const loadNoteContentCompleteAction = new LoadNoteContentCompleteAction({ note: noteItem, content });

            store.dispatch(selectNoteAction);
            store.dispatch(loadNoteContentCompleteAction);
            state.collection = noteCollectionReducer(state.collection, selectNoteAction);
            state.editor = noteEditorReducer(state.editor, loadNoteContentCompleteAction);
        });

        it('should save with appended snippet.', fakeAsync(() => {
            // Make state.
            const snippet = new NoteSnippetContentDummy().create();
            const action = new AppendSnippetAction({ snippet });

            state.editor = noteEditorReducer(state.editor, action);
            store.dispatch(action);

            // Flow action
            (noteEditor.saveNote as jasmine.Spy).and.returnValue(of(null));

            const callback = jasmine.createSpy('save current note callback');
            const subscription = contentEffects.saveCurrentNote.subscribe(callback);

            actions.next(action);
            tick(NOTE_EDITOR_SAVE_NOTE_CONTENT_THROTTLE_TIME);

            expect(noteEditor.saveNote).toHaveBeenCalledWith(
                state.collection.selectedNote,
                state.editor.selectedNoteContent,
            );
            expect(callback).toHaveBeenCalledWith(new SaveNoteContentCompleteAction());
            subscription.unsubscribe();
        }));
    });

    describe('resizeEditor', () => {
        it('should resize snippets after debounce time when \'CHANGE_VIEW_MODE\' '
            + 'action called.', fakeAsync(() => {
            const callback = jasmine.createSpy('resize editor callback');
            const subscription = contentEffects.resizeEditor.subscribe(callback);

            actions.next(new ChangeViewModeAction({ viewMode: NoteEditorViewModes.PREVIEW_ONLY }));
            tick(NOTE_EDITOR_RESIZE_THROTTLE_TIME);
            tick(0);

            expect(listManager.resizeSnippets).toHaveBeenCalled();
            subscription.unsubscribe();
        }));
    });
});
