import { Action } from '@ngrx/store';
import { NoteContent, NoteSnippetContent } from './note-content.model';
import { NoteEditorViewModes } from './note-editor.state';
import { NoteItem } from './note-item.model';


export enum NoteEditorActionTypes {
    LOAD_NOTE_CONTENT = '[NoteEditor] Load note content',
    LOAD_NOTE_CONTENT_COMPLETE = '[NoteEditor] Load note content complete',
    LOAD_NOTE_CONTENT_ERROR = '[NoteEditor] Load note content error',
    CANCEL_NOTE_CONTENT_LOADING = '[NoteEditor] Cancel note content loading',
    REMOVE_NOTE_CONTENT = '[NoteEditor] Remove note content',
    INSERT_SNIPPET = '[NoteEditor] Insert snippet',
    REMOVE_SNIPPET = '[NoteEditor] Remove snippet',
    UPDATE_SNIPPET = '[NoteEditor] Update snippet',
    SET_ACTIVE_SNIPPET_INDEX = '[NoteEditor] Set active snippet index',
    UNSET_ACTIVE_SNIPPET_INDEX = '[NoteEditor] Unset active snippet index',
    CHANGE_VIEW_MODE = '[NoteEditor] Change view mode',
}


export class LoadNoteContentAction implements Action {
    readonly type = NoteEditorActionTypes.LOAD_NOTE_CONTENT;

    constructor(readonly payload: { note: NoteItem }) {
    }
}


export class LoadNoteContentCompleteAction implements Action {
    readonly type = NoteEditorActionTypes.LOAD_NOTE_CONTENT_COMPLETE;

    constructor(readonly payload: { content: NoteContent }) {
    }
}


export class LoadNoteContentErrorAction implements Action {
    readonly type = NoteEditorActionTypes.LOAD_NOTE_CONTENT_ERROR;

    constructor(readonly error?: any) {
    }
}


export class CancelNoteContentLoadingAction implements Action {
    readonly type = NoteEditorActionTypes.CANCEL_NOTE_CONTENT_LOADING;
}


export class RemoveNoteContentAction implements Action {
    readonly type = NoteEditorActionTypes.REMOVE_NOTE_CONTENT;
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


export class SetActiveSnippetIndexAction implements Action {
    readonly type = NoteEditorActionTypes.SET_ACTIVE_SNIPPET_INDEX;

    constructor(readonly payload: { activeIndex: number }) {
    }
}


export class UnsetActiveSnippetIndexAction implements Action {
    readonly type = NoteEditorActionTypes.UNSET_ACTIVE_SNIPPET_INDEX;
}


export class ChangeEditorViewModeAction implements Action {
    readonly type = NoteEditorActionTypes.CHANGE_VIEW_MODE;

    constructor(readonly payload: { viewMode: NoteEditorViewModes }) {
    }
}


export type NoteEditorActions =
    LoadNoteContentAction
    | LoadNoteContentCompleteAction
    | LoadNoteContentErrorAction
    | CancelNoteContentLoadingAction
    | RemoveNoteContentAction
    | InsertSnippetAction
    | RemoveSnippetAction
    | UpdateSnippetAction
    | SetActiveSnippetIndexAction
    | UnsetActiveSnippetIndexAction
    | ChangeEditorViewModeAction;
