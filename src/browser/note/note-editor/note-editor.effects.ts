import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { map, tap } from 'rxjs/operators';
import { NoteCollectionActionTypes, SelectNoteAction } from '../note-collection';
import { LoadNoteContentAction, LoadNoteContentCompleteAction, NoteEditorActionTypes } from './note-editor.actions';
import { NoteSnippetListManager } from './note-snippet-list-manager';


@Injectable()
export class NoteEditorEffects {
    @Effect()
    loadNoteContentWhenNoteSelected = this.actions.pipe(
        ofType(NoteCollectionActionTypes.SELECT_NOTE),
        map((action: SelectNoteAction) => new LoadNoteContentAction({ note: action.payload.note })),
    );

    @Effect({ dispatch: false })
    disposeEditor = this.actions.pipe(
        ofType(NoteCollectionActionTypes.DESELECT_NOTE),
        tap(() => {
            this.snippetListManager.removeAllSnippets();
        }),
    );

    @Effect({ dispatch: false })
    afterNoteContentLoaded = this.actions.pipe(
        ofType(NoteEditorActionTypes.LOAD_NOTE_CONTENT_COMPLETE),
        tap((action: LoadNoteContentCompleteAction) => {
            this.snippetListManager.removeAllSnippets();
            this.snippetListManager.addAllSnippetsFromContent(action.payload.content);
        }),
    );

    constructor(
        private actions: Actions,
        private snippetListManager: NoteSnippetListManager,
    ) {
    }
}
