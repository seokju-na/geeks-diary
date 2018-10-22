import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import {
    catchError,
    debounceTime,
    distinctUntilChanged,
    map,
    mergeMap,
    switchMap,
    take,
    takeUntil,
} from 'rxjs/operators';
import { NoteState, NoteStateWithRoot } from '../note.state';
import {
    LoadNoteContentAction,
    LoadNoteContentCompleteAction,
    LoadNoteContentErrorAction,
    NoteEditorAction,
    NoteEditorActionTypes,
    SaveNoteContentCompleteAction,
    SaveNoteContentErrorAction,
} from './note-editor.actions';
import { NoteEditorService } from './note-editor.service';


export const NOTE_EDITOR_LOAD_NOTE_CONTENT_THROTTLE = 50;
export const NOTE_EDITOR_SAVE_NOTE_CONTENT_THROTTLE_TIME = 200;


@Injectable()
export class NoteContentEffects {
    @Effect()
    load: Observable<NoteEditorAction> = this.actions.pipe(
        // Match 'LOAD_NOTE_CONTENT' action.
        ofType(NoteEditorActionTypes.LOAD_NOTE_CONTENT),

        // Throttling action.
        debounceTime(NOTE_EDITOR_LOAD_NOTE_CONTENT_THROTTLE),

        // Dismiss same action.
        distinctUntilChanged<LoadNoteContentAction>((prev, next) => prev.payload.note.id === next.payload.note.id),

        // Cancel note content loading, if cancelling action received.
        takeUntil(this.actions.pipe(ofType(NoteEditorActionTypes.CANCEL_NOTE_CONTENT_LOADING))),

        // Switch to note content loading task.
        switchMap((action: LoadNoteContentAction) =>
            this.editorService.loadNoteContent(action.payload.note).pipe(
                // Cancel note content loading, if cancelling action received.
                takeUntil(this.actions.pipe(ofType(NoteEditorActionTypes.CANCEL_NOTE_CONTENT_LOADING))),

                map(content => new LoadNoteContentCompleteAction({
                    note: action.payload.note,
                    content,
                })),
                catchError(error => of(new LoadNoteContentErrorAction(error))),
            ),
        ),
    );

    @Effect()
    saveCurrentNote: Observable<NoteEditorAction> = this.actions.pipe(
        ofType(
            NoteEditorActionTypes.APPEND_SNIPPET,
            NoteEditorActionTypes.UPDATE_SNIPPET,
            NoteEditorActionTypes.INSERT_SNIPPET,
            NoteEditorActionTypes.REMOVE_SNIPPET,
        ),
        debounceTime(NOTE_EDITOR_SAVE_NOTE_CONTENT_THROTTLE_TIME),
        switchMap(() =>
            this.store.pipe(
                select(state => state.note),
                take(1),
                mergeMap((noteState: NoteState) =>
                    this.editorService.saveNote(
                        noteState.collection.selectedNote,
                        noteState.editor.selectedNoteContent,
                    ).pipe(
                        map(() => new SaveNoteContentCompleteAction()),
                        catchError(error => of(new SaveNoteContentErrorAction(error))),
                    ),
                ),
            ),
        ),
    );

    constructor(
        private actions: Actions,
        private store: Store<NoteStateWithRoot>,
        private editorService: NoteEditorService,
    ) {
    }
}
