import { NoteSnippet } from '../../../models/note-snippet';


export interface NoteContent {
    readonly noteId: string;
    readonly snippets: NoteSnippetContent[];
}


export interface NoteSnippetContent extends NoteSnippet {
    readonly value: string;
}
