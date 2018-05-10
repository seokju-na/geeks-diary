import { Action } from '@ngrx/store';
import { NoteContent, NoteFinderDateFilterTypes, NoteMetadata } from './models';


export enum NoteActionTypes {
    GET_NOTE_COLLECTION = '[Note] Get note collection',
    GET_NOTE_COLLECTION_COMPLETE = '[Note] Get note collection complete',
    SAVE_NOTE = '[Note] Save note',
    SAVE_NOTE_COMPLETE = '[Note] Save note complete',
    SAVE_NOTE_ERROR = '[Note] Save note error',
    SAVE_NOTE_CONTENT = '[Note] Save note content',
    SAVE_NOTE_CONTENT_COMPLETE = '[Note] Save note content complete',
    SAVE_NOTE_CONTENT_ERROR = '[Note] Save note content error',
    CHANGE_DATE_FILTER = '[Note] Change date filter',
    SELECT_NOTE = '[Note] Select note',
    LOAD_NOTE_CONTENT = '[Note] Load note content',
    LOAD_NOTE_CONTENT_COMPLETE = '[Note] Load note content complete',
}


export class GetNoteCollectionAction implements Action {
    readonly type = NoteActionTypes.GET_NOTE_COLLECTION;
}


export class GetNoteCollectionCompleteAction implements Action {
    readonly type = NoteActionTypes.GET_NOTE_COLLECTION_COMPLETE;

    constructor(readonly payload: { notes: NoteMetadata[] }) {
    }
}


export class ChangeDateFilterAction implements Action {
    readonly type = NoteActionTypes.CHANGE_DATE_FILTER;

    constructor(readonly payload: {
        dateFilter: Date | null,
        dateFilterBy: NoteFinderDateFilterTypes,
    }) {}
}


export class SelectNoteAction implements Action {
    readonly type = NoteActionTypes.SELECT_NOTE;

    constructor(readonly payload: { selectedNote: NoteMetadata }) {
    }
}


export class LoadNoteContentAction implements Action {
    readonly type = NoteActionTypes.LOAD_NOTE_CONTENT;

    constructor(readonly payload: { note: NoteMetadata }) {
    }
}


export class LoadNoteContentCompleteAction implements Action {
    readonly type = NoteActionTypes.LOAD_NOTE_CONTENT_COMPLETE;

    constructor(readonly payload: { content: NoteContent }) {
    }
}


export class SaveNoteContentAction implements Action {
    readonly type = NoteActionTypes.SAVE_NOTE_CONTENT;

    constructor(readonly payload: { content: NoteContent }) {
    }
}


export class SaveNoteContentCompleteAction implements Action {
    readonly type = NoteActionTypes.SAVE_NOTE_CONTENT_COMPLETE;
}


export class SaveNoteContentErrorAction implements Action {
    readonly type = NoteActionTypes.SAVE_NOTE_CONTENT_ERROR;

    constructor(readonly error?: any) {
    }
}


export type NoteActions =
    GetNoteCollectionAction
    | GetNoteCollectionCompleteAction
    | ChangeDateFilterAction
    | SelectNoteAction
    | LoadNoteContentAction
    | LoadNoteContentCompleteAction
    | SaveNoteContentAction
    | SaveNoteContentCompleteAction;
