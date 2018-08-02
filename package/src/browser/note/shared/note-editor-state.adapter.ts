import { NoteSnippetContent } from './note-content.model';
import { NoteEditorState } from './note-editor.state';


export function withNoteSnippetContentInsertion(
    state: NoteEditorState,
    index: number,
    snippetContent: NoteSnippetContent,
): NoteEditorState {
    if (!state.loaded) {
        return state;
    }

    const snippets = [...state.selectedNoteContent.snippets];
    snippets.splice(index + 1, 0, snippetContent);

    return {
        ...state,
        selectedNoteContent: {
            ...state.selectedNoteContent,
            snippets,
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
    snippets.splice(index, 1);

    return {
        ...state,
        selectedNoteContent: {
            ...state.selectedNoteContent,
            snippets,
        },
    };
}
