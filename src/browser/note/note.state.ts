import { NoteCollectionState } from './note-collection';
import { NoteEditorState } from './note-editor';


export interface NoteState {
    collection: NoteCollectionState;
    editor: NoteEditorState;
}


export interface NoteStateWithRoot {
    note: NoteState;
}
