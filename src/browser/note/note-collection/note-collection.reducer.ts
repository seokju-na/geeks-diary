import { Sorting } from '../../../core/sorting';
import { datetime } from '../../../libs/datetime';
import { NoteCollectionAction, NoteCollectionActionTypes } from './note-collection.actions';
import {
    createNoteCollectionInitialState,
    NoteCollectionFilterBy,
    NoteCollectionSortBy,
    NoteCollectionState,
} from './note-collection.state';
import { NoteItem } from './note-item.model';


const sorting = new Sorting<NoteItem>();


/**
 * Note state adapter.
 * @param state
 */
function withFilteredAndSortedNotes(state: NoteCollectionState): NoteCollectionState {
    let notes: NoteItem[];

    // Filter notes.
    let filterSource;

    switch (state.filterBy) {
        case NoteCollectionFilterBy.BY_MONTH:
            filterSource = new Date(
                state.selectedMonth.year,
                state.selectedMonth.month,
            );

            notes = state.notes.filter(note =>
                datetime.isAtSameMonth(filterSource, new Date(note.createdDatetime)));

            break;

        case NoteCollectionFilterBy.BY_DATE:
            filterSource = new Date(
                state.selectedDate.year,
                state.selectedDate.month,
                state.selectedDate.date,
            );

            notes = state.notes.filter(note =>
                datetime.isSameDay(filterSource, new Date(note.createdDatetime)));

            break;

        default:
            notes = [...state.notes];
            break;
    }

    // Sort notes.
    switch (state.sortBy) {
        case NoteCollectionSortBy.CREATED:
            sorting.setIndexPropGetter(note => note.createdDatetime);
            break;

        case NoteCollectionSortBy.UPDATED:
            sorting.setIndexPropGetter(note => note.updatedDatetime);
            break;

        case NoteCollectionSortBy.TITLE:
            sorting.setIndexPropGetter(note => note.title);
            break;
    }

    sorting
        .setDirection(state.sortDirection)
        .sort(notes);

    return {
        ...state,
        filteredAndSortedNotes: notes,
    };
}


function withNoteUpadation(
    state: NoteCollectionState,
    index: number,
    patch: Partial<NoteItem>,
): NoteCollectionState {
    const target = state.notes[index];

    if (target === undefined) {
        return state;
    }

    const notes = [...state.notes];
    notes[index] = { ...notes[index], ...patch };

    // If index of note is currently selected, update it.
    if (notes[index].id === state.selectedNote.id) {
        return {
            ...state,
            selectedNote: {
                ...state.selectedNote,
                ...patch,
            },
            notes,
        };
    } else {
        return { ...state, notes };
    }
}


export function noteCollectionReducer(
    state: NoteCollectionState = createNoteCollectionInitialState(),
    action: NoteCollectionAction,
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

        case NoteCollectionActionTypes.UPDATE_CONTRIBUTION:
            return {
                ...state,
                contribution: { ...action.payload.contribution },
            };

        case NoteCollectionActionTypes.CHANGE_NOTE_TITLE:
            return withFilteredAndSortedNotes(
                withNoteUpadation(
                    state,
                    state.notes.findIndex(note => note.id === action.payload.note.id),
                    {
                        title: action.payload.title,
                        contentFilePath: action.payload.contentFilePath,
                        contentFileName: action.payload.contentFileName,
                    },
                ),
            );

        default:
            return state;
    }
}
