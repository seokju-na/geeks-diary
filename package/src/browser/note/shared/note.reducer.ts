import { ActionReducerMap } from '@ngrx/store';
import { noteCollectionReducer } from './note-collection.reducer';
import { noteEditorReducer } from './note-editor.reducer';
import { NoteState } from './note.state';


export const noteReducerMap: ActionReducerMap<NoteState> = {
    collection: noteCollectionReducer,
    editor: noteEditorReducer,
};
