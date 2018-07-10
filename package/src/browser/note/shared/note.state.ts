import { NoteCollectionState } from './note-collection.state';


export interface NoteState {
    collection: NoteCollectionState;
}


export interface NoteStateWithRoot {
    note: NoteState;
}
