import { NoteSnippetContent } from './note-content.model';
import { NoteEditorAction, NoteEditorActionTypes } from './note-editor.actions';
import { createNoteEditorInitialState, NoteEditorState } from './note-editor.state';


export function withNoteSnippetContentInsertion(
    state: NoteEditorState,
    index: number,
    snippetContent: NoteSnippetContent,
): NoteEditorState {
    if (!state.loaded) {
        return state;
    }
    const snippets = [...state.selectedNoteContent.snippets];

    // Insert new snippet after index.
    snippets.splice(index, 0, snippetContent);

    return {
        ...state,
        selectedNoteContent: {
            ...state.selectedNoteContent,
            snippets,
        },
    };
}


export function withNoteSnippetContentAppendation(
    state: NoteEditorState,
    snippetContent: NoteSnippetContent,
): NoteEditorState {
    if (!state.loaded) {
        return state;
    }

    return {
        ...state,
        selectedNoteContent: {
            ...state.selectedNoteContent,
            snippets: state.selectedNoteContent.snippets.concat([snippetContent]),
        },
    };
}


export function withNoteSnippetContentRemove(
    state: NoteEditorState,
    index: number,
): NoteEditorState {
    if (!state.loaded) {
        return state;
    }
    const snippets = [...state.selectedNoteContent.snippets];

    // Remove snippet at index.
    snippets.splice(index, 1);

    return {
        ...state,
        selectedNoteContent: {
            ...state.selectedNoteContent,
            snippets,
        },
    };
}


export function withNoteSnippetContentUpadation(
    state: NoteEditorState,
    index: number,
    patch: Partial<NoteSnippetContent>,
): NoteEditorState {
    if (!state.loaded) {
        return state;
    }

    const snippets = [...state.selectedNoteContent.snippets];

    if (!snippets[index]) {
        return state;
    }

    // Update target snippet.
    snippets[index] = { ...snippets[index], ...patch };

    return {
        ...state,
        selectedNoteContent: {
            ...state.selectedNoteContent,
            snippets,
        },
    };
}


/**
 * Note editor reducer.
 * @param state
 * @param action
 */
export function noteEditorReducer(
    state: NoteEditorState = createNoteEditorInitialState(),
    action: NoteEditorAction,
): NoteEditorState {

    switch (action.type) {
        case NoteEditorActionTypes.INIT:
            return state;

        case NoteEditorActionTypes.LOAD_NOTE_CONTENT:
            return {
                ...state,
                loading: true,
            };

        case NoteEditorActionTypes.LOAD_NOTE_CONTENT_COMPLETE:
            return {
                ...state,
                loading: false,
                loaded: true,
                selectedNoteContent: { ...action.payload.content },
            };

        case NoteEditorActionTypes.APPEND_SNIPPET:
            return withNoteSnippetContentAppendation(state, action.payload.snippet);

        case NoteEditorActionTypes.INSERT_SNIPPET:
            return withNoteSnippetContentInsertion(
                state,
                action.payload.index,
                action.payload.snippet,
            );

        case NoteEditorActionTypes.REMOVE_SNIPPET:
            return withNoteSnippetContentRemove(state, action.payload.index);

        case NoteEditorActionTypes.UPDATE_SNIPPET:
            return withNoteSnippetContentUpadation(
                state,
                action.payload.index,
                action.payload.patch,
            );

        case NoteEditorActionTypes.FOCUS_SNIPPET:
            return {
                ...state,
                activeSnippetIndex: action.payload.index,
            };

        case NoteEditorActionTypes.BLUR_SNIPPET:
            return {
                ...state,
                activeSnippetIndex: null,
            };

        default:
            return state;
    }
}
