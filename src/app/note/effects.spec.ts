import { fakeAsync, flush, inject, TestBed } from '@angular/core/testing';
import { Actions } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of } from 'rxjs/observable/of';
import { Subject } from 'rxjs/Subject';
import { createDummyList } from '../../testing/dummy';
import { MockActions, MockFsService } from '../../testing/mock';
import {
    GetNoteCollectionAction,
    GetNoteCollectionCompleteAction, LoadNoteContentAction, LoadNoteContentCompleteAction,
    SelectNoteAction,
} from './actions';
import { NoteContentDummyFactory, NoteMetadataDummyFactory } from './dummies';
import { NoteEffects } from './effects';
import { NoteFsService } from './note-fs.service';


describe('app.note.effects.NoteEffects', () => {
    let noteEffects: NoteEffects;

    let mockActions: MockActions;
    let noteFsService: NoteFsService;

    let actions: Subject<Action>;
    let callback: jasmine.Spy;

    beforeEach(() => {
        TestBed
            .configureTestingModule({
                imports: [
                ],
                providers: [
                    ...MockFsService.providersForTesting,
                    ...MockActions.providersForTesting,
                    NoteFsService,
                    NoteEffects,
                ],
            });
    });

    beforeEach(inject(
        [NoteEffects, NoteFsService, Actions],
        (n: NoteEffects, ns: NoteFsService, a: MockActions) => {
            noteEffects = n;
            noteFsService = ns;
            mockActions = a;
        },
    ));

    beforeEach(() => {
        actions = new Subject<Action>();
        callback = jasmine.createSpy('callback');

        mockActions.stream = actions;
    });

    describe('getCollection', () => {
        it('should return new \'GET_NOTE_COLLECTION_COMPLETE\' action, ' +
            'with the note collection, on success.', fakeAsync(() => {

            const collection = createDummyList(new NoteMetadataDummyFactory(), 10);

            spyOn(noteFsService, 'readNoteMetadataCollection')
                .and.returnValue(of(collection));

            noteEffects.getCollection.subscribe(callback);
            actions.next(new GetNoteCollectionAction());
            flush();

            const expected = new GetNoteCollectionCompleteAction({
                notes: collection,
            });

            expect(callback).toHaveBeenCalledWith(expected);
        }));
    });

    describe('afterSelectNote', () => {
        it('should return new \'LOAD_NOTE_CONTENT\' action, with the selected note, ' +
            'after select note.', fakeAsync(() => {

            const selectedNote = new NoteMetadataDummyFactory().create();

            noteEffects.afterSelectNote.subscribe(callback);
            actions.next(new SelectNoteAction({ selectedNote }));
            flush();

            const expected = new LoadNoteContentAction({
                note: selectedNote,
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

            noteEffects.loadContent.subscribe(callback);
            actions.next(new LoadNoteContentAction({ note }));
            flush();

            const expected = new LoadNoteContentCompleteAction({ content });

            expect(callback).toHaveBeenCalledWith(expected);
        }));
    });
});
