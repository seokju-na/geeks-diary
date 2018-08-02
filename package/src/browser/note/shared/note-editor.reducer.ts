import { withNoteSnippetContentInsertion, withNoteSnippetContentRemove } from './note-editor-state.adapter';
import { NoteEditorActions, NoteEditorActionTypes } from './note-editor.actions';
import { createNoteEditorInitialState, NoteEditorState } from './note-editor.state';


export function noteEditorReducer(
    state: NoteEditorState = createNoteEditorInitialState(),
    action: NoteEditorActions,
): NoteEditorState {

    switch (action.type) {
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

        case NoteEditorActionTypes.REMOVE_NOTE_CONTENT:
            return {
                ...state,
                loaded: false,
                selectedNoteContent: null,
                activeSnippetIndex: null,
            };

        case NoteEditorActionTypes.INSERT_SNIPPET:
            return withNoteSnippetContentInsertion(
                state,
                action.payload.index,
                action.payload.snippet,
            );

        case NoteEditorActionTypes.REMOVE_SNIPPET:
            return withNoteSnippetContentRemove(state, action.payload.index);

        case NoteEditorActionTypes.SET_ACTIVE_SNIPPET_INDEX:
            return {
                ...state,
                activeSnippetIndex: action.payload.activeIndex,
            };

        case NoteEditorActionTypes.UNSET_ACTIVE_SNIPPET_INDEX:
            return {
                ...state,
                activeSnippetIndex: null,
            };

        case NoteEditorActionTypes.CHANGE_VIEW_MODE:
            return {
                ...state,
                viewMode: action.payload.viewMode,
            };

        default:
            return state;
    }
}
