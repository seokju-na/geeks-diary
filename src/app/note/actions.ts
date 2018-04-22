import { Action } from '@ngrx/store';
import { NoteSimple } from './models';


export enum NoteActionTypes {
    GET_NOTE_COLLECTION = '[Note] Get note collection',
    GET_NOTE_COLLECTION_COMPLETE = '[Note] Get note collection complete',
    GET_NOTE_COLLECTION_ERROR = '[Note] Get note collection error',
    SAVE_NOTE = '[Note] Save note',
    SAVE_NOTE_COMPLETE = '[Note] Save note complete',
    SAVE_NOTE_ERROR = '[Note] Save note error',
    CREATE_SNIPPET = '[Note] Create snippet',
}


export class GetNoteCollectionAction implements Action {
    readonly type = NoteActionTypes.GET_NOTE_COLLECTION;
}


export class GetNoteCollectionCompleteAction implements Action {
    readonly type = NoteActionTypes.GET_NOTE_COLLECTION_COMPLETE;

    constructor(readonly noteSimples: NoteSimple[]) {
    }
}


export type NoteActions =
    GetNoteCollectionAction
    | GetNoteCollectionCompleteAction;
