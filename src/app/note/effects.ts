import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { map, switchMap } from 'rxjs/operators';
import {
    GetNoteCollectionCompleteAction,
    LoadNoteContentAction,
    LoadNoteContentCompleteAction,
    NoteActionTypes,
    SelectNoteAction,
} from './actions';
import { NoteFsService } from './note-fs.service';


@Injectable()
export class NoteEffects {
    @Effect()
    getCollection: Observable<Action> = this.actions.pipe(
        ofType(NoteActionTypes.GET_NOTE_COLLECTION),
        switchMap(() => this.noteFsService.readNoteMetadataCollection()),
        map(notes => new GetNoteCollectionCompleteAction({ notes })),
    );

    @Effect()
    afterSelectNote: Observable<Action> = this.actions.pipe(
        ofType(NoteActionTypes.SELECT_NOTE),
        map((action: SelectNoteAction) =>
            new LoadNoteContentAction({ note: action.payload.selectedNote })),
    );

    @Effect()
    loadContent: Observable<Action> = this.actions.pipe(
        ofType(NoteActionTypes.LOAD_NOTE_CONTENT),
        switchMap((action: LoadNoteContentAction) =>
            this.noteFsService.readNoteContent(action.payload.note.fileName)),
        map(content => new LoadNoteContentCompleteAction({ content })),
    );

    constructor(
        private readonly actions: Actions,
        private noteFsService: NoteFsService,
    ) {}
}
