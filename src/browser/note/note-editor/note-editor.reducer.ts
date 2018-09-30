import { NoteEditorAction, NoteEditorTypes } from './note-editor.actions';
import { createNoteEditorInitialState, NoteEditorState } from './note-editor.state';


export function noteEditorReducer(
    state: NoteEditorState = createNoteEditorInitialState(),
    action: NoteEditorAction,
): NoteEditorState {

    switch (action.type) {
        case NoteEditorTypes.INIT:
            return state;

        default:
            return state;
    }
}
