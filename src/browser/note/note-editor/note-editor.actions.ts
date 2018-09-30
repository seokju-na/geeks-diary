import { Action } from '@ngrx/store';


export enum NoteEditorTypes {
    INIT = '[NoteEditor] Init',
}


export class InitNoteEditorAction implements Action {
    readonly type = NoteEditorTypes.INIT;
}


export type NoteEditorAction =
    InitNoteEditorAction;
