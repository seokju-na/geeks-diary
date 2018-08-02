import { NoteSnippetEditor } from './note-snippet-editor';


export enum NoteSnippetEditorEventNames {
    INSERT_NEW_SNIPPET_AFTER_THIS = 'INSERT_NEW_SNIPPET_AFTER_THIS',
    REMOVE_THIS = 'REMOVE_THIS',
    VALUE_CHANGED = 'VALUE_CHANGED',
    MOVE_FOCUS_TO_PREVIOUS = 'MOVE_FOCUS_TO_PREVIOUS',
    MOVE_FOCUS_TO_NEXT = 'MOVE_FOCUS_TO_NEXT',
    FOCUSED = 'FOCUSED',
    BLURRED = 'BLURRED',
}


export class NoteSnippetEditorEvent {
    constructor(
        public readonly name: NoteSnippetEditorEventNames,
        public readonly source: NoteSnippetEditor,
    ) {
    }
}
