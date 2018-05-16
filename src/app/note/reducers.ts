import { ActionReducerMap } from '@ngrx/store';
import { datetime } from '../../common/datetime';
import { AppState } from '../app-reducers';
import { NoteActions, NoteActionTypes } from './actions';
import {
    NoteContent,
    NoteContentSnippet,
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
        sortDirection: NoteFinderSortDirection.ASC,
    };
}


export function createInitialNoteEditorState(): NoteEditorState {
    return {
        loaded: false,
        selectedNoteContent: null,
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

        case NoteActionTypes.SELECT_NOTE:
            return {
                ...state,
                selectedNote: action.payload.selectedNote,
            };

        case NoteActionTypes.UPDATE_STACKS:
            if (!state.loaded) {
                return state;
            }

            const selectedNoteId = state.selectedNote.id;
            const index = state.notes.findIndex(note => note.id === selectedNoteId);

            state.notes[index] = {
                ...state.notes[index],
                stacks: [...action.payload.stacks],
            };

            return {
                ...state,
                notes: [...state.notes],
                selectedNote: {
                    ...state.selectedNote,
                    stacks: [...action.payload.stacks],
                },
            };

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
            return noteEditorStateAdapter(state).removeSnippet(action.payload.snippetId);

        case NoteActionTypes.UPDATE_SNIPPET_CONTENT:
            return noteEditorStateAdapter(state).updateSnippet(
                action.payload.snippetId,
                action.payload.patch,
            );

        case NoteActionTypes.UPDATE_STACKS:
            if (!state.loaded) {
                return state;
            }

            return {
                ...state,
                selectedNoteContent: {
                    ...state.selectedNoteContent,
                    stacks: [...action.payload.stacks],
                },
            };

        default:
            return state;
    }
}


// State adapters
class NoteEditorStateAdapter {
    constructor(readonly state: NoteEditorState) {
    }

    removeSnippet(snippetId: string): NoteEditorState {
        const index = this.indexOfSnippet(snippetId);

        if (index !== -1 && this.getSnippetsCount() > 1) {
            this.state.selectedNoteContent.snippets.splice(index, 1);

            return this.getSnippetsUpdated();
        }

        return this.state;
    }

    updateSnippet(
        snippetId: string,
        patch: Partial<NoteContentSnippet>,
    ): NoteEditorState {

        const index = this.indexOfSnippet(snippetId);

        if (index !== -1) {
            const snippet = this.state.selectedNoteContent.snippets[index];

            this.state.selectedNoteContent.snippets[index] = {
                ...snippet,
                ...patch,
            };

            return this.getSnippetsUpdated();
        }

        return this.state;
    }

    private indexOfSnippet(snippetId: string): number {
        if (!this.state.loaded) {
            return -1;
        }

        return this.state.selectedNoteContent.snippets.findIndex(
            snippet => snippet.id === snippetId);
    }

    private getSnippetsCount(): number {
        if (!this.state.loaded) {
            return 0;
        }

        return this.state.selectedNoteContent.snippets.length;
    }

    private getSnippetsUpdated(): NoteEditorState {
        return {
            ...this.state,
            selectedNoteContent: {
                ...this.state.selectedNoteContent,
                snippets: [...this.state.selectedNoteContent.snippets],
            },
        };
    }
}


export function noteEditorStateAdapter(state: NoteEditorState): NoteEditorStateAdapter {
    return new NoteEditorStateAdapter(state);
}


// Reducer map
export const noteReducerMap: ActionReducerMap<NoteStateForFeature> = {
    collection: noteCollectionReducer,
    finder: noteFinderReducer,
    editor: noteEditorReducer,
};
