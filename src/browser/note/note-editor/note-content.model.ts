import { NoteSnippetTypes } from '../../../core/note';


export interface NoteContent {
    readonly noteId?: string;
    readonly snippets: NoteSnippetContent[];
}


export interface NoteSnippetContent {
    readonly type: NoteSnippetTypes;

    readonly value: string;

    /** Language id which code snippet contains. */
    readonly codeLanguageId?: string;

    /** File name which code snippet contains. */
    readonly codeFileName?: string;
}
