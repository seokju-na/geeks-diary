import { Action } from '@ngrx/store';
import { SortDirection } from '../../../core/sorting';
import { NoteCollectionSortBy, NoteCollectionViewModes, NoteContributionTable } from './note-collection.state';
import { NoteItem } from './note-item.model';


export enum NoteCollectionActionTypes {
    LOAD_COLLECTION = '[NoteCollection] Load collection',
    LOAD_COLLECTION_COMPLETE = '[NoteCollection] Load collection complete',
    LOAD_COLLECTION_ERROR = '[NoteCollection] Load collection error',
    SELECT_MONTH_FILTER = '[NoteCollection] Select month filter',
    SELECT_DATE_FILTER = '[NoteCollection] Select date filter',
    CHANGE_SORT_ORDER = '[NoteCollection] Change sort order',
    CHANGE_SORT_DIRECTION = '[NoteCollection] Change sort direction',
    CHANGE_VIEW_MODE = '[NoteCollection] Change view mode',
    SELECT_NOTE = '[NoteCollection] Select note',
    DESELECT_NOTE = '[NoteCollection] Deselect note',
    ADD_NOTE = '[NoteCollection] Add note',
    UPDATE_CONTRIBUTION = '[NoteCollection] Update contribution',
    UPDATE_CONTRIBUTION_FAIL = '[NoteCollection] Update contribution fail',
    CHANGE_NOTE_TITLE = '[NoteCollection] Change note title',
    DELETE_NOTE = '[NoteCollection] Delete note',
    CHANGE_NOTE_STACKS = '[NoteCollection] Change note stacks',
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


export class ChangeViewModeAction implements Action {
    readonly type = NoteCollectionActionTypes.CHANGE_VIEW_MODE;

    constructor(readonly payload: { viewMode: NoteCollectionViewModes }) {
    }
}


export class SelectNoteAction implements Action {
    readonly type = NoteCollectionActionTypes.SELECT_NOTE;

    constructor(readonly payload: { note: NoteItem }) {
    }
}


export class DeselectNoteAction implements Action {
    readonly type = NoteCollectionActionTypes.DESELECT_NOTE;
}


export class AddNoteAction implements Action {
    readonly type = NoteCollectionActionTypes.ADD_NOTE;

    constructor(readonly payload: { note: NoteItem }) {
    }
}


export class UpdateNoteContributionAction implements Action {
    readonly type = NoteCollectionActionTypes.UPDATE_CONTRIBUTION;

    constructor(public readonly payload: { contribution: NoteContributionTable }) {
    }
}


export class UpdateNoteContributionFailAction implements Action {
    readonly type = NoteCollectionActionTypes.UPDATE_CONTRIBUTION_FAIL;

    constructor(public readonly error?: any) {
    }
}


export class ChangeNoteTitleAction implements Action {
    readonly type = NoteCollectionActionTypes.CHANGE_NOTE_TITLE;

    constructor(public readonly payload: {
        note: NoteItem,
        title: string,
        contentFileName: string,
        contentFilePath: string,
    }) {
    }
}


export class DeleteNoteAction implements Action {
    readonly type = NoteCollectionActionTypes.DELETE_NOTE;

    constructor(public readonly payload: { note: NoteItem }) {
    }
}


export class ChangeNoteStacksAction implements Action {
    readonly type = NoteCollectionActionTypes.CHANGE_NOTE_STACKS;

    constructor(public readonly payload: {
        note: NoteItem,
        stacks: string[],
    }) {
    }
}


export type NoteCollectionAction =
    LoadNoteCollectionAction
    | LoadNoteCollectionCompleteAction
    | LoadNoteCollectionErrorAction
    | SelectMonthFilterAction
    | SelectDateFilterAction
    | ChangeSortOrderAction
    | ChangeSortDirectionAction
    | ChangeViewModeAction
    | SelectNoteAction
    | DeselectNoteAction
    | AddNoteAction
    | UpdateNoteContributionAction
    | UpdateNoteContributionFailAction
    | ChangeNoteTitleAction
    | DeleteNoteAction
    | ChangeNoteStacksAction;
