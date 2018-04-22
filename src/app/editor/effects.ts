import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { EditorActionTypes, RemoveSnippetAction } from './actions';
import { EditorService } from './editor.service';


@Injectable()
export class EditorEffects {
    @Effect()
    removeSnippet = this.actions.pipe(
        ofType(EditorActionTypes.REMOVE_SNIPPET),
        tap((action: RemoveSnippetAction) =>
            this.editorService.removeSnippet(action.payload.snippetId)),
    );

    constructor(
        private readonly actions: Actions,
        private editorService: EditorService,
    ) {}
}
