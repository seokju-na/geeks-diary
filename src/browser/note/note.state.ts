import { NoteCollectionState } from './note-collection';


export interface NoteState {
    collection: NoteCollectionState;
}


export interface NoteStateWithRoot {
    note: NoteState;
}
