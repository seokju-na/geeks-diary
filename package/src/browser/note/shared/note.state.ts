import { NoteCollectionState } from './note-collection.state';
import { NoteEditorState } from './note-editor.state';


export interface NoteState {
    collection: NoteCollectionState;
    editor: NoteEditorState;
}


export interface NoteStateWithRoot {
    note: NoteState;
}
