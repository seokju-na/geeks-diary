export interface NoteEditorState {
    readonly loaded: boolean;
}


export function createNoteEditorInitialState(): NoteEditorState {
    return {
        loaded: false,
    };
}
