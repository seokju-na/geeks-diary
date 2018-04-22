import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { NoteActionTypes } from './actions';


@Injectable()
export class NoteEffects {
    @Effect()
    getCollection: Observable<Action> = this.actions.pipe(
        ofType(NoteActionTypes.GET_NOTE_COLLECTION),
    );

    constructor(private readonly actions: Actions) {
    }
}
