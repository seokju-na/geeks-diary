import { fakeAsync, flush, inject, TestBed, tick } from '@angular/core/testing';
import { Actions } from '@ngrx/effects';
import { Action, combineReducers, Store, StoreModule } from '@ngrx/store';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { of } from 'rxjs/observable/of';
import { Subject } from 'rxjs/Subject';
import { createDummyList } from '../../testing/dummy';
import { MockActions, MockFsService } from '../../testing/mock';
import {
    AddNoteAction,
    AddNoteCompleteAction,
    AddNoteErrorAction,
    GetNoteCollectionAction,
    GetNoteCollectionCompleteAction,
    InsertNewSnippetAction,
    LoadNoteContentAction,
    LoadNoteContentCompleteAction,
    RemoveSnippetAction,
    SaveSelectedNoteAction,
    UpdateSnippetContentAction,
    UpdateStacksAction,
    UpdateTitleAction,
} from './actions';
import {
    NoteContentDummyFactory,
    NoteContentSnippetDummyFactory,
    NoteMetadataDummyFactory,
} from './dummies';
import { NoteEditorService } from './editor/editor.service';
import { NoteEditorSnippetFactory } from './editor/snippet/snippet-factory';
import { NoteEditorEffects, NoteFsEffects } from './effects';
import { noteReducerMap, NoteStateWithRoot } from './reducers';
import { NoteFsService } from './shared/note-fs.service';
import { NoteSelectionService } from './shared/note-selection.service';


describe('app.note.effects.NoteFsEffects', () => {
    let noteFsEffects: NoteFsEffects;

    let noteFsService: NoteFsService;
    let store: Store<NoteStateWithRoot>;
    let mockActions: MockActions;
    let noteSelectioNService: NoteSelectionService;

    let actions: Subject<Action>;
    let callback: jasmine.Spy;

    beforeEach(() => {
        TestBed
            .configureTestingModule({
                imports: [
                    StoreModule.forRoot({
                        note: combineReducers(noteReducerMap),
                    }),
                ],
                providers: [
                    ...MockActions.providersForTesting,
                    ...MockFsService.providersForTesting,
                    NoteSelectionService,
                    NoteFsService,
                    NoteFsEffects,
                ],
            });
    });

    beforeEach(inject(
        [NoteFsEffects, NoteFsService, Store, Actions],
        (nfe: NoteFsEffects, nfs: NoteFsService, s: Store<NoteStateWithRoot>, a: MockActions) => {
            noteFsEffects = nfe;
            noteFsService = nfs;
            store = s;
            mockActions = a;
        },
    ));

    beforeEach(() => {
        actions = new Subject<Action>();
        callback = jasmine.createSpy('callback');
        noteSelectioNService = TestBed.get(NoteSelectionService);

        mockActions.stream = actions;
    });

    describe('getCollection', () => {
        it('should return new \'GET_NOTE_COLLECTION_COMPLETE\' action, ' +
            'with the note collection, on success.', fakeAsync(() => {

            const collection = createDummyList(new NoteMetadataDummyFactory(), 10);

            spyOn(noteFsService, 'readNoteMetadataCollection')
                .and.returnValue(of(collection));

            noteFsEffects.getCollection.subscribe(callback);
            actions.next(new GetNoteCollectionAction());
            flush();

            const expected = new GetNoteCollectionCompleteAction({
                notes: collection,
            });

            expect(callback).toHaveBeenCalledWith(expected);
        }));
    });

    describe('loadContent', () => {
        it('should return new \'LOAD_NOTE_CONTENT_COMPLETE\' action, ' +
            'with the note content, on success.', fakeAsync(() => {

            const note = new NoteMetadataDummyFactory().create();
            const content = new NoteContentDummyFactory().create(note.id);

            spyOn(noteFsService, 'readNoteContent')
                .and.returnValue(of(content));

            noteFsEffects.loadContent.subscribe(callback);
            actions.next(new LoadNoteContentAction({ note }));
            flush();

            const expected = new LoadNoteContentCompleteAction({ content });

            expect(callback).toHaveBeenCalledWith(expected);
        }));
    });

    describe('addNote', () => {
        it('should return new \'ADD_NOTE_COMPLETE\' action, ' +
            'with new note metadata, on success.', fakeAsync(() => {

            const note = new NoteMetadataDummyFactory().create();
            const content = new NoteContentDummyFactory().create(note.id);

            spyOn(noteFsService, 'createNote').and.returnValue(of(null));

            noteFsEffects.addNote.subscribe(callback);
            actions.next(new AddNoteAction({ metadata: note, content }));
            flush();

            const expected = new AddNoteCompleteAction({ note });

            expect(callback).toHaveBeenCalledWith(expected);
        }));

        it('should return new \'ADD_NOTE_ERROR\' action, ' +
            'with error, on fail.', fakeAsync(() => {

            const note = new NoteMetadataDummyFactory().create();
            const content = new NoteContentDummyFactory().create(note.id);

            const error = new Error('Some error');

            spyOn(noteFsService, 'createNote')
                .and.returnValue(ErrorObservable.create(error));

            noteFsEffects.addNote.subscribe(callback);
            actions.next(new AddNoteAction({ metadata: note, content }));
            flush();

            const expected = new AddNoteErrorAction(error);

            expect(callback).toHaveBeenCalledWith(expected);
        }));
    });

    describe('afterAddNote', () => {
        it('should ', fakeAsync(() => {
            const note = new NoteMetadataDummyFactory().create();

            spyOn(noteSelectioNService, 'selectNote');

            noteFsEffects.afterAddNote.subscribe(callback);
            actions.next(new AddNoteCompleteAction({ note }));
            flush();

            expect(noteSelectioNService.selectNote).toHaveBeenCalledWith(note);
        }));
    });
});


describe('app.note.effects.NoteEditorEffects', () => {
    let noteEditorEffects: NoteEditorEffects;

    let noteEditorService: NoteEditorService;
    let mockActions: MockActions;

    let actions: Subject<Action>;
    let callback: jasmine.Spy;

    beforeEach(() => {
        TestBed
            .configureTestingModule({
                providers: [
                    ...MockActions.providersForTesting,
                    NoteEditorSnippetFactory,
                    NoteEditorService,
                    NoteEditorEffects,
                ],
            });
    });

    beforeEach(inject(
        [NoteEditorEffects, NoteEditorService, Actions],
        (nee: NoteEditorEffects, nes: NoteEditorService, a: MockActions) => {
            noteEditorEffects = nee;
            noteEditorService = nes;
            mockActions = a;
        },
    ));

    beforeEach(() => {
        actions = new Subject<Action>();
        callback = jasmine.createSpy('callback');

        mockActions.stream = actions;
    });

    describe('afterUpdate', () => {
        it('should return new \'SAVE_SELECTED_NOTE\' action after debounced.', fakeAsync(() => {
            let action: Action;

            const expected = new SaveSelectedNoteAction();

            noteEditorEffects.afterUpdate.subscribe(callback);

            // REMOVE_SNIPPET
            action = new RemoveSnippetAction({ snippetId: 'test-id' });
            actions.next(action);
            tick(400);

            expect(callback).toHaveBeenCalledWith(expected);

            // INSERT_NEW_SNIPPET
            action = new InsertNewSnippetAction({
                snippetId: 'test-id',
                content: new NoteContentSnippetDummyFactory().create(),
            });
            actions.next(action);
            tick(400);

            expect(callback).toHaveBeenCalledWith(expected);

            // UPDATE_SNIPPET_CONTENT
            action = new UpdateSnippetContentAction({
                snippetId: 'test-id',
                patch: {},
            });
            actions.next(action);
            tick(400);

            expect(callback).toHaveBeenCalledWith(expected);

            // UPDATE_STACKS
            action = new UpdateStacksAction({ stacks: [] });
            actions.next(action);
            tick(400);

            expect(callback).toHaveBeenCalledWith(expected);

            // UPDATE_TITLE
            action = new UpdateTitleAction({ title: 'New Title' });
            actions.next(action);
            tick(400);

            expect(callback).toHaveBeenCalledWith(expected);
        }));
    });
});
