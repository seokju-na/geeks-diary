import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import {
    catchError,
    debounceTime,
    delay,
    filter,
    map,
    mergeMap,
    switchMap,
    take,
    takeUntil,
    tap,
} from 'rxjs/operators';
import { NoteCollectionAction, NoteCollectionActionTypes } from '../note-collection';
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
import { NoteSnippetListManager } from './note-snippet-list-manager';


export const NOTE_EDITOR_LOAD_NOTE_CONTENT_THROTTLE = 50;
export const NOTE_EDITOR_SAVE_NOTE_CONTENT_THROTTLE_TIME = 200;
export const NOTE_EDITOR_RESIZE_THROTTLE_TIME = 50;


export const NOTE_EDITOR_RESIZE_EFFECTS = new InjectionToken<string[]>('NoteEditorResizeEffects');


@Injectable()
export class NoteContentEffects {
    @Effect()
    load: Observable<NoteEditorAction> = this.actions.pipe(
        // Match 'LOAD_NOTE_CONTENT' action.
        ofType(NoteEditorActionTypes.LOAD_NOTE_CONTENT),

        // Throttling action.
        debounceTime(NOTE_EDITOR_LOAD_NOTE_CONTENT_THROTTLE),

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
    saveCurrentNote: Observable<NoteEditorAction | NoteCollectionAction> = this.actions.pipe(
        ofType(
            NoteEditorActionTypes.APPEND_SNIPPET,
            NoteEditorActionTypes.UPDATE_SNIPPET,
            NoteEditorActionTypes.INSERT_SNIPPET,
            NoteEditorActionTypes.REMOVE_SNIPPET,
            NoteCollectionActionTypes.CHANGE_NOTE_TITLE,
            NoteCollectionActionTypes.CHANGE_NOTE_STACKS,
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
    private readonly resizeEffects: string[];
    @Effect({ dispatch: false })
    resizeEditor = this.actions.pipe(
        filter(action => this.resizeEffects.some(type => action.type === type)),
        debounceTime(NOTE_EDITOR_RESIZE_THROTTLE_TIME),
        delay(0),
        tap(() => {
            this.listManager.resizeSnippets();
        }),
    );

    constructor(
        private actions: Actions,
        private store: Store<NoteStateWithRoot>,
        private editorService: NoteEditorService,
        @Optional() @Inject(NOTE_EDITOR_RESIZE_EFFECTS) resizeEffects: string[],
        private listManager: NoteSnippetListManager,
    ) {
        this.resizeEffects = (resizeEffects || []).concat([
            NoteEditorActionTypes.CHANGE_VIEW_MODE,
        ]);
    }
}
