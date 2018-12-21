import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { logMonitor } from '../../core/log-monitor';
import { NoteCollectionActionTypes } from '../note/note-collection';
import { NoteEditorActionTypes } from '../note/note-editor';
import { VcsActionTypes } from '../vcs';


@Injectable()
export class ErrorCollectEffects {
    @Effect({ dispatch: false })
    collectErrors = this.actions.pipe(
        ofType(
            NoteCollectionActionTypes.LOAD_COLLECTION_ERROR,
            NoteEditorActionTypes.LOAD_NOTE_CONTENT_ERROR,
            NoteEditorActionTypes.SAVE_NOTE_CONTENT_ERROR,
            VcsActionTypes.LOAD_COMMIT_HISTORY_FAIL,
            VcsActionTypes.SYNCHRONIZED_FAIL,
            VcsActionTypes.UPDATE_FILE_CHANGES_FAIL,
        ),
        tap((action: any) => {
            logMonitor.logException(action.error);
            console.error(action.error);
        }),
    );

    constructor(private actions: Actions) {
    }
}
