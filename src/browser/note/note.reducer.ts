import { ActionReducerMap } from '@ngrx/store';
import { noteCollectionReducer } from './note-collection';
import { NoteState } from './note.state';


export const noteReducerMap: ActionReducerMap<NoteState> = {
    collection: noteCollectionReducer,
};
