import { NoteSnippet } from '../../../models/note-snippet';
import { NoteItem } from './note-item.model';


export interface NoteContent {
    readonly note: NoteItem;
}


export interface NoteSnippetContent extends NoteSnippet {
    readonly value: string;
}
