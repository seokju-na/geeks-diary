import { createDummies } from '../../../../test/helpers/dummies';
import { datetime, DateUnits } from '../../../libs/datetime';
import { SortDirection } from '../../../models/sorting';
import { NoteItemDummy } from '../dummies';
import {
    ChangeSortDirectionAction,
    ChangeSortOrderAction,
    LoadNoteCollectionAction,
    LoadNoteCollectionCompleteAction,
    SelectDateFilterAction,
    SelectMonthFilterAction,
} from './note-collection.actions';
import { noteCollectionReducer } from './note-collection.reducer';
import {
    createNoteCollectionInitialState,
    NoteCollectionFilterBy,
    NoteCollectionSortBy,
} from './note-collection.state';


describe('noteCollectionReducer', () => {
    describe('LOAD_COLLECTION', () => {
        it('should set loading to true.', () => {
            const state = noteCollectionReducer(
                undefined,
                new LoadNoteCollectionAction(),
            );

            expect(state.loading).toBe(true);
        });
    });

    describe('LOAD_COLLECTION_COMPLETE', () => {
        it('should set notes.', () => {
            const notes = createDummies(new NoteItemDummy(), 10);
            const state = noteCollectionReducer(
                undefined,
                new LoadNoteCollectionCompleteAction({ notes }),
            );

            expect(state.loading).toBe(false);
            expect(state.loaded).toBe(true);
            expect(state.notes).toEqual(notes);
        });
    });

    describe('SELECT_MONTH_FILTER', () => {
        it('should set selected month.', () => {
            const targetDate = datetime.today();
            datetime.add(targetDate, DateUnits.MONTH, 2);

            const state = noteCollectionReducer(
                undefined,
                new SelectMonthFilterAction({ date: targetDate }),
            );

            expect(state.selectedMonth.year).toEqual(targetDate.getFullYear());
            expect(state.selectedMonth.month).toEqual(targetDate.getMonth());
        });

        it('should set filter option to \'BY_MONTH\' and selected date to null.', () => {
            const beforeState = {
                ...createNoteCollectionInitialState(),
                filterBy: NoteCollectionFilterBy.BY_DATE,
            };

            const targetDate = datetime.today();
            datetime.add(targetDate, DateUnits.MONTH, 2);

            const state = noteCollectionReducer(
                beforeState,
                new SelectMonthFilterAction({ date: targetDate }),
            );

            expect(state.filterBy).toEqual(NoteCollectionFilterBy.BY_MONTH);
            expect(state.selectedDate).toBeNull();
        });
    });

    describe('SELECT_DATE_FILTER', () => {
        it('should set selected date.', () => {
            const targetDate = datetime.today();
            datetime.add(targetDate, DateUnits.MONTH, -2);

            const state = noteCollectionReducer(
                undefined,
                new SelectDateFilterAction({ date: targetDate }),
            );

            expect(state.selectedDate.year).toEqual(targetDate.getFullYear());
            expect(state.selectedDate.month).toEqual(targetDate.getMonth());
            expect(state.selectedDate.date).toEqual(targetDate.getDate());
        });

        it('should set filter option to \'BY_DATE\'', () => {
            const targetDate = datetime.today();
            datetime.add(targetDate, DateUnits.MONTH, -2);

            const state = noteCollectionReducer(
                undefined,
                new SelectDateFilterAction({ date: targetDate }),
            );

            expect(state.filterBy).toEqual(NoteCollectionFilterBy.BY_DATE);
        });
    });

    describe('CHANGE_SORT_ORDER', () => {
        it('should set sort order.', () => {
            const state = noteCollectionReducer(
                undefined,
                new ChangeSortOrderAction({ sortBy: NoteCollectionSortBy.TITLE }),
            );

            expect(state.sortBy).toEqual(NoteCollectionSortBy.TITLE);
        });
    });

    describe('CHANGE_SORT_DIRECTION', () => {
        it('should set sort direction.', () => {
            const state = noteCollectionReducer(
                undefined,
                new ChangeSortDirectionAction({ sortDirection: SortDirection.ASC }),
            );

            expect(state.sortDirection).toEqual(SortDirection.ASC);
        });
    });
});
