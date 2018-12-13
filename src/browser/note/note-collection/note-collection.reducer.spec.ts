import { createDummies, sampleWithout } from '../../../../test/helpers';
import { SortDirection } from '../../../core/sorting';
import { datetime, DateUnits } from '../../../libs/datetime';
import { NoteItemDummy, prepareForFilteringNotes, prepareForSortingNotes } from './dummies';
import {
    AddNoteAction,
    ChangeSortDirectionAction,
    ChangeSortOrderAction,
    ChangeViewModeAction,
    DeselectNoteAction,
    LoadNoteCollectionAction,
    LoadNoteCollectionCompleteAction,
    SelectDateFilterAction,
    SelectMonthFilterAction,
    SelectNoteAction,
    UpdateNoteContributionAction,
} from './note-collection.actions';
import { noteCollectionReducer } from './note-collection.reducer';
import {
    createNoteCollectionInitialState,
    NoteCollectionFilterBy,
    NoteCollectionSortBy,
    NoteCollectionState,
    NoteCollectionViewModes,
    NoteContributionTable,
} from './note-collection.state';
import { NoteItem } from './note-item.model';


describe('browser.note.noteCollection.noteCollectionReducer', () => {
    const defaultState = createNoteCollectionInitialState();

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

        it('should filtered and sorted notes are made.', () => {
            const notes = createDummies(new NoteItemDummy(), 5);

            prepareForFilteringNotes(
                notes,
                ['x', 'o', 'x', 'o', 'o'],
                {
                    by: defaultState.filterBy,
                    value: new Date(
                        defaultState.selectedMonth.year,
                        defaultState.selectedMonth.month,
                    ),
                },
            );

            prepareForSortingNotes(
                notes,
                ['x', 3, 'x', 1, 2],
                {
                    by: defaultState.sortBy,
                    direction: defaultState.sortDirection,
                },
            );

            const state = noteCollectionReducer(
                undefined,
                new LoadNoteCollectionCompleteAction({ notes }),
            );

            expect(state.filteredAndSortedNotes).toEqual([
                notes[3],
                notes[4],
                notes[1],
            ]);
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

        it('should filtered and sorted notes are made.', () => {
            // Initialize
            const notes = createDummies(new NoteItemDummy(), 5);
            const beforeState = noteCollectionReducer(
                undefined,
                new LoadNoteCollectionCompleteAction({ notes }),
            );

            const selectedMonth = datetime.today();
            datetime.add(selectedMonth, DateUnits.MONTH, 3);

            prepareForFilteringNotes(
                notes,
                ['x', 'x', 'o', 'o', 'x'],
                { by: NoteCollectionFilterBy.BY_MONTH, value: selectedMonth },
            );

            const state = noteCollectionReducer(
                beforeState,
                new SelectMonthFilterAction({ date: selectedMonth }),
            );

            expect(state.filteredAndSortedNotes).toContain(notes[2]);
            expect(state.filteredAndSortedNotes).toContain(notes[3]);
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

        it('should filtered and sorted notes are made.', () => {
            // Initialize
            const notes = createDummies(new NoteItemDummy(), 5);
            const beforeState = noteCollectionReducer(
                undefined,
                new LoadNoteCollectionCompleteAction({ notes }),
            );

            const selectedDate = datetime.today();
            datetime.add(selectedDate, DateUnits.DAY, -3);

            prepareForFilteringNotes(
                notes,
                ['o', 'x', 'o', 'x', 'o'],
                { by: NoteCollectionFilterBy.BY_DATE, value: selectedDate },
            );

            const state = noteCollectionReducer(
                beforeState,
                new SelectDateFilterAction({ date: selectedDate }),
            );

            expect(state.filteredAndSortedNotes).toContain(notes[0]);
            expect(state.filteredAndSortedNotes).toContain(notes[2]);
            expect(state.filteredAndSortedNotes).toContain(notes[4]);
        });
    });

    describe('CHANGE_SORT_ORDER', () => {
        let notes: NoteItem[];

        const defaultDirection = createNoteCollectionInitialState().sortDirection;
        const loadNotes = () => noteCollectionReducer(
            undefined,
            new LoadNoteCollectionCompleteAction({ notes }),
        );

        beforeEach(() => {
            notes = createDummies(new NoteItemDummy(), 5);
        });

        it('should set sort order.', () => {
            const state = noteCollectionReducer(
                undefined,
                new ChangeSortOrderAction({ sortBy: NoteCollectionSortBy.TITLE }),
            );

            expect(state.sortBy).toEqual(NoteCollectionSortBy.TITLE);
        });

        it('should sort notes well by \'CREATED\'.', () => {
            const sortBy = NoteCollectionSortBy.CREATED;

            prepareForSortingNotes(
                notes,
                [5, 3, 4, 1, 2],
                { by: sortBy, direction: defaultDirection },
            );

            const state = noteCollectionReducer(
                loadNotes(),
                new ChangeSortOrderAction({ sortBy }),
            );

            expect(state.filteredAndSortedNotes).toEqual([
                notes[3],
                notes[4],
                notes[1],
                notes[2],
                notes[0],
            ]);
        });

        it('should sort notes well by \'TITLE\'.', () => {
            const sortBy = NoteCollectionSortBy.TITLE;

            prepareForSortingNotes(
                notes,
                [5, 4, 3, 2, 1],
                { by: sortBy, direction: defaultDirection },
            );

            const state = noteCollectionReducer(
                loadNotes(),
                new ChangeSortOrderAction({ sortBy }),
            );

            expect(state.filteredAndSortedNotes).toEqual([
                notes[4],
                notes[3],
                notes[2],
                notes[1],
                notes[0],
            ]);
        });
    });

    describe('CHANGE_SORT_DIRECTION', () => {
        let notes: NoteItem[];

        const defaultSortBy = createNoteCollectionInitialState().sortBy;
        const loadNotes = () => noteCollectionReducer(
            undefined,
            new LoadNoteCollectionCompleteAction({ notes }),
        );

        beforeEach(() => {
            notes = createDummies(new NoteItemDummy(), 5);
        });

        it('should set sort direction.', () => {
            const state = noteCollectionReducer(
                undefined,
                new ChangeSortDirectionAction({ sortDirection: SortDirection.ASC }),
            );

            expect(state.sortDirection).toEqual(SortDirection.ASC);
        });

        it('should sort notes well on \'ASC\' direction.', () => {
            const direction = SortDirection.ASC;

            prepareForSortingNotes(
                notes,
                [1, 3, 2, 5, 4],
                { by: defaultSortBy, direction },
            );

            const state = noteCollectionReducer(
                loadNotes(),
                new ChangeSortDirectionAction({ sortDirection: direction }),
            );

            expect(state.filteredAndSortedNotes).toEqual([
                notes[0],
                notes[2],
                notes[1],
                notes[4],
                notes[3],
            ]);
        });

        it('should sort notes well on \'DESC\' direction.', () => {
            const direction = SortDirection.DESC;

            prepareForSortingNotes(
                notes,
                [3, 4, 5, 1, 2],
                { by: defaultSortBy, direction },
            );

            const state = noteCollectionReducer(
                loadNotes(),
                new ChangeSortDirectionAction({ sortDirection: direction }),
            );

            expect(state.filteredAndSortedNotes).toEqual([
                notes[3],
                notes[4],
                notes[0],
                notes[1],
                notes[2],
            ]);
        });
    });

    describe('CHANGE_VIEW_MODE', () => {
        it('should set view mode.', () => {
            const viewMode = sampleWithout<NoteCollectionViewModes>(
                NoteCollectionViewModes,
                [defaultState.viewMode],
            );

            const state = noteCollectionReducer(
                defaultState,
                new ChangeViewModeAction({ viewMode }),
            );

            expect(state.viewMode).toEqual(viewMode);
        });
    });

    describe('SELECT_NOTE', () => {
        it('should set selected note.', () => {
            const note = new NoteItemDummy().create();
            const state = noteCollectionReducer(
                undefined,
                new SelectNoteAction({ note }),
            );

            expect(state.selectedNote).toEqual(note);
        });
    });

    describe('DESELECT_NOTE', () => {
        let note: NoteItem;
        let beforeState: NoteCollectionState;

        beforeEach(() => {
            note = new NoteItemDummy().create();
            beforeState = noteCollectionReducer(
                undefined,
                new SelectNoteAction({ note }),
            );
        });

        it('should set selected note as null.', () => {
            const state = noteCollectionReducer(
                beforeState,
                new DeselectNoteAction(),
            );

            expect(state.selectedNote).toEqual(null);
        });
    });

    describe('ADD_NOTE', () => {
        const dummy = new NoteItemDummy();
        let beforeNotes: NoteItem[];
        let beforeState: NoteCollectionState;

        beforeEach(() => {
            beforeNotes = createDummies(dummy, 10);
            beforeState = noteCollectionReducer(
                undefined,
                new LoadNoteCollectionCompleteAction({ notes: beforeNotes }),
            );
        });

        it('should add note.', () => {
            const newNote = dummy.create();
            const state = noteCollectionReducer(
                beforeState,
                new AddNoteAction({ note: newNote }),
            );

            expect(state.notes.includes(newNote)).toBe(true);
        });
    });

    describe('UPDATE_CONTRIBUTION', () => {
        it('should set note contribution.', () => {
            const contribution: NoteContributionTable = { a: 3 };
            const state = noteCollectionReducer(
                undefined,
                new UpdateNoteContributionAction({ contribution }),
            );

            expect(state.contribution).toEqual(contribution);
        });
    });
});
