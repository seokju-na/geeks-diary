import { ActionReducerMap } from '@ngrx/store';
import { noteCollectionReducer } from './note-collection.reducer';
import { NoteState } from './note.state';


export const noteReducerMap: ActionReducerMap<NoteState> = {
    collection: noteCollectionReducer,
};
