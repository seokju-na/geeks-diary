import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { tap } from 'rxjs/operators';
import { LoadNoteContentCompleteAction, NoteActionTypes } from '../note/actions';
import { EditorActions, EditorActionTypes, RemoveSnippetAction } from './actions';
import { EditorService } from './editor.service';


@Injectable()
export class EditorEffects {
    @Effect({ dispatch: false })
    initEditor: Observable<Action> = this.actions.pipe(
        ofType(NoteActionTypes.LOAD_NOTE_CONTENT_COMPLETE),
        tap((action: LoadNoteContentCompleteAction) =>
            this.editorService.initFromNoteContent(action.payload.content)),
    );

    @Effect({ dispatch: false })
    removeSnippet: Observable<Action> = this.actions.pipe(
        ofType(EditorActionTypes.REMOVE_SNIPPET),
        tap((action: RemoveSnippetAction) =>
            this.editorService.removeSnippet(action.payload.snippetId)),
    );

    @Effect({ dispatch: false })
    moveFocus: Observable<Action> = this.actions.pipe(
        ofType(
            EditorActionTypes.MOVE_FOCUS_TO_NEXT_SNIPPET,
            EditorActionTypes.MOVE_FOCUS_TO_PREVIOUS_SNIPPET,
        ),
        tap((action: EditorActions) => {
            switch (action.type) {
                case EditorActionTypes.MOVE_FOCUS_TO_PREVIOUS_SNIPPET:
                    this.editorService.moveFocus(action.payload.snippetId, -1);
                    break;

                case EditorActionTypes.MOVE_FOCUS_TO_NEXT_SNIPPET:
                    this.editorService.moveFocus(action.payload.snippetId, 1);
                    break;
            }
        }),
    );

    constructor(
        private readonly actions: Actions,
        private editorService: EditorService,
    ) {}
}
