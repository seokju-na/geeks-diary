import { Action } from '@ngrx/store';
import { SortDirection } from '../../../libs/sorting';
import { NoteCollectionSortBy } from './note-collection.state';
import { NoteItem } from './note-item.model';


export enum NoteCollectionActionTypes {
    LOAD_COLLECTION = '[NoteCollection] Load collection',
    LOAD_COLLECTION_COMPLETE = '[NoteCollection] Load collection complete',
    LOAD_COLLECTION_ERROR = '[NoteCollection] Load collection error',

    SELECT_MONTH_FILTER = '[NoteCollection] Select month filter',
    SELECT_DATE_FILTER = '[NoteCollection] Select date filter',

    CHANGE_SORT_ORDER = '[NoteCollection] Change sort order',
    CHANGE_SORT_DIRECTION = '[NoteCollection] Change sort direction',
}


export class LoadNoteCollectionAction implements Action {
    readonly type = NoteCollectionActionTypes.LOAD_COLLECTION;
}


export class LoadNoteCollectionCompleteAction implements Action {
    readonly type = NoteCollectionActionTypes.LOAD_COLLECTION_COMPLETE;

    constructor(readonly payload: { notes: NoteItem[] }) {
    }
}


export class LoadNoteCollectionErrorAction implements Action {
    readonly type = NoteCollectionActionTypes.LOAD_COLLECTION_ERROR;

    constructor(readonly error?: any) {
    }
}


export class SelectMonthFilterAction implements Action {
    readonly type = NoteCollectionActionTypes.SELECT_MONTH_FILTER;

    constructor(readonly payload: { date: Date }) {
    }
}


export class SelectDateFilterAction implements Action {
    readonly type = NoteCollectionActionTypes.SELECT_DATE_FILTER;

    constructor(readonly payload: { date: Date }) {
    }
}


export class ChangeSortOrderAction implements Action {
    readonly type = NoteCollectionActionTypes.CHANGE_SORT_ORDER;

    constructor(readonly payload: { sortBy: NoteCollectionSortBy }) {
    }
}


export class ChangeSortDirectionAction implements Action {
    readonly type = NoteCollectionActionTypes.CHANGE_SORT_DIRECTION;

    constructor(readonly payload: { sortDirection: SortDirection }) {
    }
}


export type NoteCollectionActions =
    LoadNoteCollectionAction
    | LoadNoteCollectionCompleteAction
    | LoadNoteCollectionErrorAction
    | SelectMonthFilterAction
    | SelectDateFilterAction
    | ChangeSortOrderAction
    | ChangeSortDirectionAction;
