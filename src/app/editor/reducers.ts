import { ActionReducerMap } from '@ngrx/store';
import { AppState } from '../app-reducers';
import { NoteContentSnippet } from '../note/models';
import { EditorActions, EditorActionTypes } from './actions';
import { EditorViewModes } from './models';


export interface EditorState {
    loaded: boolean;
    noteId: string | null;
    title: string;
    snippets: NoteContentSnippet[];
    fileName: string | null;
    viewMode: EditorViewModes;
}


export interface EditorStateForFeature {
    editor: EditorState;
}


export interface EditorStateWithRoot extends AppState {
    editor: EditorStateForFeature;
}


export function createInitialEditorState(): EditorState {
    return {
        loaded: false,
        noteId: null,
        title: '',
        snippets: [],
        fileName: null,
        viewMode: EditorViewModes.SHOW_BOTH,
    };
}


export function editorReducer(
    state = createInitialEditorState(),
    action: EditorActions,
): EditorState {

    const indexOfSnippet = (snippetId: string): number =>
        state.snippets.findIndex(snippet => snippet.id === snippetId);

    let index: number;

    switch (action.type) {
        case EditorActionTypes.INIT_EDITOR_WITH_NOTE_CONTENT:
            return {
                ...state,
                loaded: true,
                noteId: action.payload.content.noteId,
                title: action.payload.content.title,
                fileName: action.payload.content.fileName,
                snippets: [...action.payload.content.snippets],
            };

        case EditorActionTypes.REMOVE_SNIPPET:
            index = indexOfSnippet(action.payload.snippetId);

            if (index !== -1 && state.snippets.length > 1) {
                state.snippets.splice(index, 1);

                return {
                    ...state,
                    snippets: [...state.snippets],
                };
            }

            return state;

        case EditorActionTypes.UPDATE_SNIPPET_CONTENT:
            index = indexOfSnippet(action.payload.snippetId);

            if (index !== -1) {
                state.snippets[index] = {
                    ...state.snippets[index],
                    ...action.payload.content,
                };

                return {
                    ...state,
                    snippets: [...state.snippets],
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
