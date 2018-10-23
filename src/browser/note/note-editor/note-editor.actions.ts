import { Action } from '@ngrx/store';
import { NoteItem } from '../note-collection';
import { NoteContent, NoteSnippetContent } from './note-content.model';


export enum NoteEditorActionTypes {
    INIT = '[NoteEditor] Init',
    LOAD_NOTE_CONTENT = '[NoteEditor] Load note content',
    LOAD_NOTE_CONTENT_COMPLETE = '[NoteEditor] Load note content complete',
    LOAD_NOTE_CONTENT_ERROR = '[NoteEditor] Load note content error',
    CANCEL_NOTE_CONTENT_LOADING = '[NoteEditor] Cancel note content loading',
    APPEND_SNIPPET = '[NoteEditor] Append snippet',
    INSERT_SNIPPET = '[NoteEditor] Insert snippet',
    REMOVE_SNIPPET = '[NoteEditor] Remove snippet',
    UPDATE_SNIPPET = '[NoteEditor] Update snippet',
    MOVE_FOCUS_TO_PREVIOUS_SNIPPET = '[NoteEditor] Move focus to previous snippet',
    MOVE_FOCUS_TO_NEXT_SNIPPET = '[NoteEditor] Move focus to next snippet',
    SAVE_NOTE_CONTENT_COMPLETE = '[NoteEditor] Save note content complete',
    SAVE_NOTE_CONTENT_ERROR = '[NoteEditor] Save note content error',
}


export class InitNoteEditorAction implements Action {
    readonly type = NoteEditorActionTypes.INIT;
}


export class LoadNoteContentAction implements Action {
    readonly type = NoteEditorActionTypes.LOAD_NOTE_CONTENT;

    constructor(public readonly payload: { note: NoteItem }) {
    }
}


export class LoadNoteContentCompleteAction implements Action {
    readonly type = NoteEditorActionTypes.LOAD_NOTE_CONTENT_COMPLETE;

    constructor(public readonly payload: { note: NoteItem, content: NoteContent }) {
    }
}


export class LoadNoteContentErrorAction implements Action {
    readonly type = NoteEditorActionTypes.LOAD_NOTE_CONTENT_ERROR;

    constructor(public readonly error?: any) {
    }
}


export class CancelLoadNoteContentAction implements Action {
    readonly type = NoteEditorActionTypes.CANCEL_NOTE_CONTENT_LOADING;
}


export class AppendSnippetAction implements Action {
    readonly type = NoteEditorActionTypes.APPEND_SNIPPET;

    constructor(readonly payload: { snippet: NoteSnippetContent }) {
    }
}


export class InsertSnippetAction implements Action {
    readonly type = NoteEditorActionTypes.INSERT_SNIPPET;

    constructor(readonly payload: {
        index: number,
        snippet: NoteSnippetContent,
    }) {
    }
}


export class RemoveSnippetAction implements Action {
    readonly type = NoteEditorActionTypes.REMOVE_SNIPPET;

    constructor(readonly payload: { index: number }) {
    }
}


export class UpdateSnippetAction implements Action {
    readonly type = NoteEditorActionTypes.UPDATE_SNIPPET;

    constructor(readonly payload: {
        index: number,
        patch: Partial<NoteSnippetContent>,
    }) {
    }
}


export class MoveFocusToPreviousSnippetAction implements Action {
    readonly type = NoteEditorActionTypes.MOVE_FOCUS_TO_PREVIOUS_SNIPPET;

    constructor(readonly payload: { index: number }) {
    }
}


export class MoveFocusToNextSnippetAction implements Action {
    readonly type = NoteEditorActionTypes.MOVE_FOCUS_TO_NEXT_SNIPPET;

    constructor(readonly payload: { index: number }) {
    }
}


export class SaveNoteContentCompleteAction implements Action {
    readonly type = NoteEditorActionTypes.SAVE_NOTE_CONTENT_COMPLETE;
}


export class SaveNoteContentErrorAction implements Action {
    readonly type = NoteEditorActionTypes.SAVE_NOTE_CONTENT_ERROR;

    constructor(readonly error?: any) {
    }
}


export type NoteEditorAction =
    InitNoteEditorAction
    | LoadNoteContentAction
    | LoadNoteContentCompleteAction
    | LoadNoteContentErrorAction
    | CancelLoadNoteContentAction
    | AppendSnippetAction
    | InsertSnippetAction
    | RemoveSnippetAction
    | UpdateSnippetAction
    | MoveFocusToPreviousSnippetAction
    | MoveFocusToNextSnippetAction
    | SaveNoteContentCompleteAction
    | SaveNoteContentErrorAction;
