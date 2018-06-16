import { Action } from '@ngrx/store';
import {
    NoteContent,
    NoteContentSnippet,
    NoteEditorViewModes,
    NoteFinderDateFilterTypes, NoteFinderSortDirection, NoteFinderSortTypes,
    NoteMetadata,
} from './models';


export enum NoteActionTypes {
    GET_NOTE_COLLECTION = '[Note] Get note collection',
    GET_NOTE_COLLECTION_COMPLETE = '[Note] Get note collection complete',
    ADD_NOTE = '[Note] Add note',
    ADD_NOTE_COMPLETE = '[Note] Add note complete',
    ADD_NOTE_ERROR = '[Note] Add note error',
    SAVE_NOTE = '[Note] Save note',
    SAVE_NOTE_COMPLETE = '[Note] Save note complete',
    SAVE_NOTE_ERROR = '[Note] Save note error',
    CHANGE_DATE_FILTER = '[Note] Change date filter',
    CHANGE_SORT = '[Note] Change sort',
    SELECT_NOTE = '[Note] Select note',
    DESELECT_NOTE = '[Note] Deselect note',
    LOAD_NOTE_CONTENT = '[Note] Load note content',
    LOAD_NOTE_CONTENT_COMPLETE = '[Note] Load note content complete',
    INIT_EDITOR = '[Note] Init editor',
    MOVE_FOCUS_TO_PREVIOUS_SNIPPET = '[Note] Move focus to previous snippet',
    MOVE_FOCUS_TO_NEXT_SNIPPET = '[Note] Move focus to next snippet',
    DID_SNIPPET_FOCUS = '[Note] Did snippet focus',
    DID_SNIPPET_BLUR = '[Note] Did snippet blur',
    REMOVE_SNIPPET = '[Note] Remove snippet',
    INSERT_NEW_SNIPPET = '[Note] Insert new snippet',
    UPDATE_SNIPPET_CONTENT = '[Note] Update snippet content',
    UPDATE_STACKS = '[Note] Update stacks',
    UPDATE_TITLE = '[Note] Update title',
    CHANGE_EDITOR_VIEW_MODE = '[Note] Change editor view mode',
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


export class ChangeSortAction implements Action {
    readonly type = NoteActionTypes.CHANGE_SORT;

    constructor(readonly payload: {
        sortBy?: NoteFinderSortTypes,
        sortDirection?: NoteFinderSortDirection,
    }) {}
}


export class SelectNoteAction implements Action {
    readonly type = NoteActionTypes.SELECT_NOTE;

    constructor(readonly payload: { selectedNote: NoteMetadata }) {
    }
}


export class DeselectNoteAction implements Action {
    readonly type = NoteActionTypes.DESELECT_NOTE;
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


export class AddNoteAction implements Action {
    readonly type = NoteActionTypes.ADD_NOTE;

    constructor(readonly payload: {
        metadata: NoteMetadata,
        content: NoteContent,
    }) {
    }
}


export class AddNoteCompleteAction implements Action {
    readonly type = NoteActionTypes.ADD_NOTE_COMPLETE;

    constructor(readonly payload: { note: NoteMetadata }) {
    }
}


export class AddNoteErrorAction implements Action {
    readonly type = NoteActionTypes.ADD_NOTE_ERROR;

    constructor(readonly error: any) {
    }
}


export class SaveSelectedNoteAction implements Action {
    readonly type = NoteActionTypes.SAVE_NOTE;
}


export class SaveSelectedNoteCompleteAction implements Action {
    readonly type = NoteActionTypes.SAVE_NOTE_COMPLETE;
}


export class SaveSelectedNoteErrorAction implements Action {
    readonly type = NoteActionTypes.SAVE_NOTE_ERROR;

    constructor(readonly error?: any) {
    }
}


export class InitEditorAction implements Action {
    readonly type = NoteActionTypes.INIT_EDITOR;

    constructor(readonly payload: { content: NoteContent }) {
    }
}


export class MoveFocusToPreviousSnippetAction implements Action {
    readonly type = NoteActionTypes.MOVE_FOCUS_TO_PREVIOUS_SNIPPET;

    constructor(readonly payload: { snippetId: string }) {
    }
}


export class MoveFocusToNextSnippetAction implements Action {
    readonly type = NoteActionTypes.MOVE_FOCUS_TO_NEXT_SNIPPET;

    constructor(readonly payload: { snippetId: string }) {
    }
}


export class DidSnippetFocusAction implements Action {
    readonly type = NoteActionTypes.DID_SNIPPET_FOCUS;

    constructor(readonly payload: { snippetId: string }) {
    }
}


export class DidSnippetBlurAction implements Action {
    readonly type = NoteActionTypes.DID_SNIPPET_BLUR;

    constructor(readonly payload: { snippetId: string }) {
    }
}


export class RemoveSnippetAction implements Action {
    readonly type = NoteActionTypes.REMOVE_SNIPPET;

    constructor(readonly payload: { snippetId: string }) {
    }
}


export class InsertNewSnippetAction implements Action {
    readonly type = NoteActionTypes.INSERT_NEW_SNIPPET;

    constructor(readonly payload: {
        snippetId: string,
        content: NoteContentSnippet,
    }) {
    }
}


export class UpdateSnippetContentAction implements Action {
    readonly type = NoteActionTypes.UPDATE_SNIPPET_CONTENT;

    constructor(readonly payload: {
        snippetId: string,
        patch: Partial<NoteContentSnippet>,
    }) {
    }
}


export class UpdateStacksAction implements Action {
    readonly type = NoteActionTypes.UPDATE_STACKS;

    constructor(readonly payload: { stacks: string[] }) {
    }
}


export class UpdateTitleAction implements Action {
    readonly type = NoteActionTypes.UPDATE_TITLE;

    constructor(readonly payload: { title: string }) {
    }
}


export class ChangeEditorViewModeAction implements Action {
    readonly type = NoteActionTypes.CHANGE_EDITOR_VIEW_MODE;

    constructor(readonly payload: { viewMode: NoteEditorViewModes }) {
    }
}


export type NoteActions =
    GetNoteCollectionAction
    | GetNoteCollectionCompleteAction
    | ChangeDateFilterAction
    | ChangeSortAction
    | SelectNoteAction
    | DeselectNoteAction
    | LoadNoteContentAction
    | LoadNoteContentCompleteAction
    | AddNoteAction
    | AddNoteCompleteAction
    | AddNoteErrorAction
    | SaveSelectedNoteAction
    | SaveSelectedNoteCompleteAction
    | SaveSelectedNoteErrorAction
    | InitEditorAction
    | MoveFocusToPreviousSnippetAction
    | MoveFocusToNextSnippetAction
    | DidSnippetFocusAction
    | DidSnippetBlurAction
    | RemoveSnippetAction
    | InsertNewSnippetAction
    | UpdateSnippetContentAction
    | UpdateStacksAction
    | UpdateTitleAction
    | ChangeEditorViewModeAction;
