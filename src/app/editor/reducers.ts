import { ActionReducerMap } from '@ngrx/store';
import { NoteContentSnippet } from '../note/models';
import { EditorActions, EditorActionTypes } from './actions';
import { EditorViewModes } from './models';


export interface EditorState {
    loaded: boolean;
    title: string | null;
    focusedSnippetId: string | null;
    snippets: NoteContentSnippet[];
    viewMode: EditorViewModes;
}


export interface EditorStateForFeature {
    editor: EditorState;
}


export function createInitialEditorState(): EditorState {
    return {
        loaded: false,
        title: null,
        focusedSnippetId: null,
        snippets: [],
        viewMode: EditorViewModes.SHOW_BOTH,
    };
}


export function editorReducer(
    state = createInitialEditorState(),
    action: EditorActions,
): EditorState {

    switch (action.type) {
        case EditorActionTypes.INIT_EDITOR:
            return {
                ...state,
                loaded: true,
                title: action.payload.note.title,
                focusedSnippetId: action.payload.content.snippets[0].id,
                snippets: [...action.payload.content.snippets],
            };

        case EditorActionTypes.REMOVE_SNIPPET:
            const index = state.snippets.findIndex(snippet =>
                snippet.id === action.payload.snippetId);
            const snippets = state.snippets;
            let nextFocusedSnippetIndex: number;

            if (index !== -1) {
                snippets.splice(index, 1);
                nextFocusedSnippetIndex = index === 0 ? 0 : index - 1;

                return {
                    ...state,
                    snippets: [...snippets],
                    focusedSnippetId: snippets[nextFocusedSnippetIndex].id,
                };
            }

            return state;

        case EditorActionTypes.CHANGE_VIEW_MODE:
            return { ...state, viewMode: action.payload.viewMode };

        default:
            return state;
    }
}


export const editorReducerMap: ActionReducerMap<EditorStateForFeature> = {
    editor: editorReducer,
};
