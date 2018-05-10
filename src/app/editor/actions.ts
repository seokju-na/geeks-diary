import { Action } from '@ngrx/store';
import { NoteContent, NoteContentSnippet } from '../note/models';
import { EditorViewModes } from './models';


export enum EditorActionTypes {
    INIT_EDITOR_WITH_NOTE_CONTENT = '[Editor] Init editor with note content',
    DID_SNIPPET_FOCUS = '[Editor] Did focus',
    DID_SNIPPET_BLUR = '[Editor] Did blur',
    MOVE_FOCUS_TO_PREVIOUS_SNIPPET = '[Editor] Move focus to previous snippet',
    MOVE_FOCUS_TO_NEXT_SNIPPET = '[Editor] Move focus to next snippet',
    SWITCH_SNIPPET_ON_NEXT = '[Editor] Switch snippet on next',
    REMOVE_SNIPPET = '[Editor] Remove snippet',
    UPDATE_SNIPPET_CONTENT = '[Editor] Update snippet content',
    CHANGE_VIEW_MODE = '[Editor] Change editor view mode',
}


export class InitEditorWithNoteContentAction implements Action {
    readonly type = EditorActionTypes.INIT_EDITOR_WITH_NOTE_CONTENT;

    constructor(readonly payload: { content: NoteContent }) {
    }
}


export class DidSnippetFocusAction implements Action {
    readonly type = EditorActionTypes.DID_SNIPPET_FOCUS;

    constructor(readonly payload: { snippetId: string }) {
    }
}


export class DidSnippetBlurAction implements Action {
    readonly type = EditorActionTypes.DID_SNIPPET_BLUR;

    constructor(readonly payload: { snippetId: string }) {
    }
}


export class MoveFocusToPreviousSnippetAction implements Action {
    readonly type = EditorActionTypes.MOVE_FOCUS_TO_PREVIOUS_SNIPPET;

    constructor(readonly payload: { snippetId: string }) {
    }
}


export class MoveFocusToNextSnippetAction implements Action {
    readonly type = EditorActionTypes.MOVE_FOCUS_TO_NEXT_SNIPPET;

    constructor(readonly payload: { snippetId: string }) {
    }
}


export class SwitchSnippetOnNextAction implements Action {
    readonly type = EditorActionTypes.SWITCH_SNIPPET_ON_NEXT;

    constructor(readonly payload: { snippetId: string }) {
    }
}


export class RemoveSnippetAction implements Action {
    readonly type = EditorActionTypes.REMOVE_SNIPPET;

    constructor(readonly payload: { snippetId: string }) {
    }
}


export class ChangeEditorViewModeAction implements Action {
    readonly type = EditorActionTypes.CHANGE_VIEW_MODE;

    constructor(readonly payload: { viewMode: EditorViewModes }) {
    }
}


export class UpdateSnippetContentAction implements Action {
    readonly type = EditorActionTypes.UPDATE_SNIPPET_CONTENT;

    constructor(readonly payload: {
        snippetId: string,
        content: Partial<NoteContentSnippet>,
    }) {}
}


export type EditorActions =
    InitEditorWithNoteContentAction
    | DidSnippetFocusAction
    | DidSnippetBlurAction
    | MoveFocusToPreviousSnippetAction
    | MoveFocusToNextSnippetAction
    | SwitchSnippetOnNextAction
    | RemoveSnippetAction
    | ChangeEditorViewModeAction
    | UpdateSnippetContentAction;
