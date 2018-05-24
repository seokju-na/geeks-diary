import { NoteContent, NoteContentSnippet, NoteMetadata } from './models';
import { NoteCollectionState, NoteEditorState } from './reducers';


export const noteCollectionStateAdapter = {
    updateNote(
        state: NoteCollectionState,
        patch: Partial<NoteMetadata>,
    ): NoteCollectionState {

        if (!state.loaded) {
            return state;
        }

        const selectedNoteId = state.selectedNote.id;
        const index = state.notes.findIndex(note => note.id === selectedNoteId);

        state.notes[index] = {
            ...state.notes[index],
            ...patch,
        };

        return {
            ...state,
            notes: [...state.notes],
            selectedNote: {
                ...state.selectedNote,
                ...patch,
            },
        };
    },
};


export const noteEditorStateAdapter = {
    insertSnippet(
        state: NoteEditorState,
        snippetId: string,
        newSnippet: NoteContentSnippet,
    ): NoteEditorState {

        if (!state.loaded) {
            return state;
        }

        const index = this._indexOfSnippet(state, snippetId);

        if (index === -1) {
            return state;
        }

        state.selectedNoteContent.snippets.splice(
            index + 1,
            0,
            newSnippet,
        );

        return this._getStateWithSnippetsUpdated(state);
    },

    updateSnippet(
        state: NoteEditorState,
        snippetId: string,
        patch: Partial<NoteContentSnippet>,
    ): NoteEditorState {

        if (!state.loaded) {
            return state;
        }

        const index = this._indexOfSnippet(state, snippetId);

        if (index === -1) {
            return state;
        }

        const snippet = state.selectedNoteContent.snippets[index];

        state.selectedNoteContent.snippets[index] = {
            ...snippet,
            ...patch,
        };

        return this._getStateWithSnippetsUpdated(state);
    },

    removeSnippet(state: NoteEditorState, snippetId: string): NoteEditorState {
        if (!state.loaded) {
            return state;
        }

        const index = this._indexOfSnippet(state, snippetId);

        if (index === -1) {
            return state;
        }

        state.selectedNoteContent.snippets.splice(index, 1);

        return this._getStateWithSnippetsUpdated(state);
    },

    updateContent(state: NoteEditorState, patch: Partial<NoteContent>): NoteEditorState {
        if (!state.loaded) {
            return state;
        }

        return {
            ...state,
            selectedNoteContent: {
                ...state.selectedNoteContent,
                ...patch,
            },
        };
    },

    _indexOfSnippet(state: NoteEditorState, snippetId: string): number {
        if (!state.loaded) {
            return -1;
        }

        return state.selectedNoteContent.snippets.findIndex(
            snippet => snippet.id === snippetId);
    },

    _getStateWithSnippetsUpdated(state: NoteEditorState): NoteEditorState {
        return {
            ...state,
            selectedNoteContent: {
                ...state.selectedNoteContent,
                snippets: [...state.selectedNoteContent.snippets],
            },
        };
    },
};
