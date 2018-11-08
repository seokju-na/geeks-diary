import { NoteContent } from './note-content.model';


export enum NoteEditorViewModes {
    EDITOR_ONLY = 'EDITOR_ONLY',
    PREVIEW_ONLY = 'PREVIEW_ONLY',
    SHOW_BOTH = 'SHOW_BOTH',
}


/**
 * Note editor state.
 */
export interface NoteEditorState {
    readonly loading: boolean;
    readonly loaded: boolean;
    readonly selectedNoteContent: NoteContent;
    readonly activeSnippetIndex: number | null;
    readonly viewMode: NoteEditorViewModes;
}


export function createNoteEditorInitialState(): NoteEditorState {
    return {
        loading: false,
        loaded: false,
        selectedNoteContent: null,
        activeSnippetIndex: null,
        viewMode: NoteEditorViewModes.SHOW_BOTH,
    };
}
