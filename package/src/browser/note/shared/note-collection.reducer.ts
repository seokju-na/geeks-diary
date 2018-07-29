import { withFilteredAndSortedNotes } from './note-collection-state.adapter';
import { NoteCollectionActions, NoteCollectionActionTypes } from './note-collection.actions';
import {
    createNoteCollectionInitialState,
    NoteCollectionFilterBy,
    NoteCollectionState,
} from './note-collection.state';


export function noteCollectionReducer(
    state: NoteCollectionState = createNoteCollectionInitialState(),
    action: NoteCollectionActions,
): NoteCollectionState {

    switch (action.type) {
        case NoteCollectionActionTypes.LOAD_COLLECTION:
            return {
                ...state,
                loading: true,
            };

        case NoteCollectionActionTypes.LOAD_COLLECTION_COMPLETE:
            return withFilteredAndSortedNotes({
                ...state,
                loading: false,
                loaded: true,
                notes: [...action.payload.notes],
            });

        case NoteCollectionActionTypes.SELECT_DATE_FILTER:
            return withFilteredAndSortedNotes({
                ...state,
                filterBy: NoteCollectionFilterBy.BY_DATE,
                selectedDate: {
                    year: action.payload.date.getFullYear(),
                    month: action.payload.date.getMonth(),
                    date: action.payload.date.getDate(),
                },
            });

        case NoteCollectionActionTypes.SELECT_MONTH_FILTER:
            return withFilteredAndSortedNotes({
                ...state,
                filterBy: NoteCollectionFilterBy.BY_MONTH,
                selectedMonth: {
                    year: action.payload.date.getFullYear(),
                    month: action.payload.date.getMonth(),
                },
                selectedDate: null,
            });

        case NoteCollectionActionTypes.CHANGE_SORT_ORDER:
            return withFilteredAndSortedNotes({
                ...state,
                sortBy: action.payload.sortBy,
            });

        case NoteCollectionActionTypes.CHANGE_SORT_DIRECTION:
            return withFilteredAndSortedNotes({
                ...state,
                sortDirection: action.payload.sortDirection,
            });

        case NoteCollectionActionTypes.CHANGE_VIEW_MODE:
            return {
                ...state,
                viewMode: action.payload.viewMode,
            };

        case NoteCollectionActionTypes.SELECT_NOTE:
            return {
                ...state,
                selectedNote: { ...action.payload.note },
            };

        case NoteCollectionActionTypes.DESELECT_NOTE:
            return {
                ...state,
                selectedNote: null,
            };

        case NoteCollectionActionTypes.ADD_NOTE:
            const notes = [...state.notes];
            notes.push(action.payload.note);

            return withFilteredAndSortedNotes({
                ...state,
                notes,
            });

        default:
            return state;
    }
}
