import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable, of, zip } from 'rxjs';
import { catchError, debounceTime, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Note } from '../../../models/note';
import { FsService } from '../../core/fs.service';
import { NoteCollectionActionTypes, SelectNoteAction } from './note-collection.actions';
import { NoteContent } from './note-content.model';
import {
    LoadNoteContentAction,
    LoadNoteContentCompleteAction,
    LoadNoteContentErrorAction,
    NoteEditorActions,
    NoteEditorActionTypes,
} from './note-editor.actions';
import { NoteEditorService } from './note-editor.service';
import { NoteItem } from './note-item.model';
import { NoteParser } from './note-parser';


export const NOTE_EDITOR_LOAD_NOTE_CONTENT_THROTTLE = 500;


@Injectable()
export class NoteContentEffects {
    @Effect({ dispatch: false })
    onSelectNote = this.actions.pipe(
        ofType(NoteCollectionActionTypes.SELECT_NOTE),
        tap((action: SelectNoteAction) =>
            this.editor.loadNoteContent(action.payload.note),
        ),
    );

    @Effect({ dispatch: false })
    onDeselectNote = this.actions.pipe(
        ofType(NoteCollectionActionTypes.DESELECT_NOTE),
        tap(() => this.editor.dispose()),
    );

    @Effect()
    load: Observable<NoteEditorActions> = this.actions.pipe(
        ofType(NoteEditorActionTypes.LOAD_NOTE_CONTENT),

        // Event debounce time.
        debounceTime(NOTE_EDITOR_LOAD_NOTE_CONTENT_THROTTLE),

        // Cancel note content loading, if cancelling action received.
        takeUntil(this.actions.pipe(ofType(
            NoteEditorActionTypes.CANCEL_NOTE_CONTENT_LOADING,
        ))),

        // Getting note content.
        switchMap((action: LoadNoteContentAction) =>
            this.getNoteContent(action.payload.note).pipe(
                // Check one more time for cancellation.
                takeUntil(this.actions.pipe(ofType(
                    NoteEditorActionTypes.CANCEL_NOTE_CONTENT_LOADING,
                ))),
                map(content =>
                    new LoadNoteContentCompleteAction({ content }),
                ),
                catchError(error =>
                    of(new LoadNoteContentErrorAction(error)),
                ),
            ),
        ),
    );

    constructor(
        private fs: FsService,
        private parser: NoteParser,
        private editor: NoteEditorService,
        private actions: Actions,
    ) {
    }

    private getNoteContent(note: NoteItem): Observable<NoteContent> {
        return zip(
            this.fs.readJsonFile<Note>(note.filePath),
            this.fs.readFile(note.contentFilePath),
        ).pipe(map(([_note, contentRawValue]) => {
            return this.parser.generateNoteContent(_note, contentRawValue);
        }));
    }
}
