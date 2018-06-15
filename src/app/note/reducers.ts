import { ActionReducerMap } from '@ngrx/store';
import { datetime } from '../../common/datetime';
import { AppState } from '../app-reducers';
import { NoteActions, NoteActionTypes } from './actions';
import { noteCollectionStateAdapter, noteEditorStateAdapter } from './adapters';
import {
    NoteContent,
    NoteEditorViewModes,
    NoteFinderDateFilterTypes,
    NoteFinderSortDirection,
    NoteFinderSortTypes,
    NoteMetadata,
} from './models';


// State interfaces
export interface NoteCollectionState {
    loaded: boolean;
    notes: NoteMetadata[];
    selectedNote: NoteMetadata | null;
}


export interface NoteFinderState {
    dateFilter: Date;
    dateFilterBy: NoteFinderDateFilterTypes;
    sortBy: NoteFinderSortTypes;
    sortDirection: NoteFinderSortDirection;
}


export interface NoteEditorState {
    loaded: boolean;
    selectedNoteContent: NoteContent | null;
    focusedSnippetId: string | null;
    viewMode: NoteEditorViewModes;
}


export interface NoteStateForFeature {
    collection: NoteCollectionState;
    finder: NoteFinderState;
    editor: NoteEditorState;
}


export interface NoteStateWithRoot extends AppState {
    note: NoteStateForFeature;
}


// Initial states
export function createInitialNoteCollectionState(): NoteCollectionState {
    return {
        loaded: false,
        notes: [],
        selectedNote: null,
    };
}


export function createInitialNoteFinderState(): NoteFinderState {
    return {
        dateFilter: datetime.today(),
        dateFilterBy: NoteFinderDateFilterTypes.MONTH,
        sortBy: NoteFinderSortTypes.CREATED,
        sortDirection: NoteFinderSortDirection.DESC,
    };
}


export function createInitialNoteEditorState(): NoteEditorState {
    return {
        loaded: false,
        selectedNoteContent: null,
        viewMode: NoteEditorViewModes.SHOW_BOTH,
        focusedSnippetId: null,
    };
}


// Reducers
export function noteCollectionReducer(
    state = createInitialNoteCollectionState(),
    action: NoteActions,
): NoteCollectionState {

    switch (action.type) {
        case NoteActionTypes.GET_NOTE_COLLECTION_COMPLETE:
            return {
                ...state,
                loaded: true,
                notes: action.payload.notes,
            };

        case NoteActionTypes.ADD_NOTE:
            return noteCollectionStateAdapter.addNote(
                state,
                action.payload.metadata,
            );

        case NoteActionTypes.SELECT_NOTE:
            return {
                ...state,
                selectedNote: action.payload.selectedNote,
            };

        case NoteActionTypes.UPDATE_STACKS:
            return noteCollectionStateAdapter.updateNote(
                state,
                { stacks: [...action.payload.stacks] },
            );

        case NoteActionTypes.UPDATE_TITLE:
            return noteCollectionStateAdapter.updateNote(
                state,
                { title: action.payload.title },
            );

        default:
            return state;
    }
}


export function noteFinderReducer(
    state = createInitialNoteFinderState(),
    action: NoteActions,
): NoteFinderState {

    switch (action.type) {
        case NoteActionTypes.CHANGE_DATE_FILTER:
            return {
                ...state,
                dateFilter: action.payload.dateFilter,
                dateFilterBy: action.payload.dateFilterBy,
            };

        case NoteActionTypes.CHANGE_SORT:
            if (action.payload.sortBy) {
                return {
                    ...state,
                    sortBy: action.payload.sortBy,
                };
            } else if (action.payload.sortDirection) {
                return {
                    ...state,
                    sortDirection: action.payload.sortDirection,
                };
            }

            return state;

        default:
            return state;
    }
}


export function noteEditorReducer(
    state = createInitialNoteEditorState(),
    action: NoteActions,
): NoteEditorState {

    switch (action.type) {
        case NoteActionTypes.INIT_EDITOR:
            return {
                ...state,
                loaded: true,
                selectedNoteContent: { ...action.payload.content },
            };

        case NoteActionTypes.REMOVE_SNIPPET:
            if (!state.loaded) {
                return state;
            }

            if (state.selectedNoteContent.snippets.length <= 1
                || noteEditorStateAdapter._indexOfSnippet(state, action.payload.snippetId) === 0) {

                return state;
            }

            return noteEditorStateAdapter.removeSnippet(
                state,
                action.payload.snippetId,
            );

        case NoteActionTypes.INSERT_NEW_SNIPPET:
            return noteEditorStateAdapter.insertSnippet(
                state,
                action.payload.snippetId,
                action.payload.content,
            );

        case NoteActionTypes.DID_SNIPPET_FOCUS:
            return {
                ...state,
                focusedSnippetId: action.payload.snippetId,
            };

        case NoteActionTypes.DID_SNIPPET_BLUR:
            if (state.focusedSnippetId === action.payload.snippetId) {
                return {
                    ...state,
                    focusedSnippetId: null,
                };
            }

            return state;

        case NoteActionTypes.UPDATE_SNIPPET_CONTENT:
            return noteEditorStateAdapter.updateSnippet(
                state,
                action.payload.snippetId,
                action.payload.patch,
            );

        case NoteActionTypes.UPDATE_STACKS:
            return noteEditorStateAdapter.updateContent(
                state,
                { stacks: action.payload.stacks },
            );

        case NoteActionTypes.UPDATE_TITLE:
            return noteEditorStateAdapter.updateContent(
                state,
                { title: action.payload.title },
            );

        case NoteActionTypes.CHANGE_EDITOR_VIEW_MODE:
            return {
                ...state,
                viewMode: action.payload.viewMode,
            };

        default:
            return state;
    }
}


// Reducer map
export const noteReducerMap: ActionReducerMap<NoteStateForFeature> = {
    collection: noteCollectionReducer,
    finder: noteFinderReducer,
    editor: noteEditorReducer,
};
