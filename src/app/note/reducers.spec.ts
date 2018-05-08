import { datetime } from '../../common/datetime';
import { createDummyList } from '../../testing/dummy';
import {
    ChangeDateFilterAction,
    GetNoteCollectionCompleteAction,
    SelectNoteAction,
} from './actions';
import { NoteMetadataDummyFactory } from './dummies';
import { NoteFinderDateFilterTypes } from './models';
import { noteCollectionReducer, noteFinderReducer } from './reducers';


describe('app.note.reducers.noteCollectionReducer', () => {
    describe('GET_NOTE_COLLECTION_COMPLETE', () => {
        it('should replace and add all notes', () => {
            const factory = new NoteMetadataDummyFactory();

            const prevNotes = createDummyList(factory, 5);
            const prevAction = new GetNoteCollectionCompleteAction({ notes: prevNotes });

            const nextNotes = createDummyList(factory, 3);
            const nextAction = new GetNoteCollectionCompleteAction({ notes: nextNotes });

            let state = noteCollectionReducer(undefined, prevAction);
            expect(state.notes).toEqual(prevNotes);

            state = noteCollectionReducer(state, nextAction);
            expect(state.notes).toEqual(nextNotes);
        });

        it('should loaded value to be true.', () => {
            const state = noteCollectionReducer(
                undefined,
                new GetNoteCollectionCompleteAction({ notes: [] }),
            );

            expect(state.loaded).toBe(true);
        });
    });

    describe('SELECT_NOTE', () => {
        it('should set selected note metadata.', () => {
            const selectedNote = new NoteMetadataDummyFactory().create();
            const state = noteCollectionReducer(
                undefined,
                new SelectNoteAction({ selectedNote }),
            );

            expect(state.selectedNote).toEqual(selectedNote);
        });
    });
});



describe('app.note.reducers.noteFinderReducer', () => {
    describe('CHANGE_DATE_FILTER', () => {
        it('should set date filters.', () => {
            const dateFilter = new Date();
            const dateFilterBy = NoteFinderDateFilterTypes.MONTH;

            const state = noteFinderReducer(
                undefined,
                new ChangeDateFilterAction({ dateFilter, dateFilterBy }),
            );

            expect(datetime.isSameDay(dateFilter, state.dateFilter)).toBe(true);
            expect(state.dateFilterBy).toEqual(NoteFinderDateFilterTypes.MONTH);
        });
    });
});
