import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, mergeMap, switchMap, take } from 'rxjs/operators';
import { AppState } from '../app-reducers';
import {
    LoadUserDataCompleteAction,
    SaveUserDataCompleteAction,
    SaveUserDataErrorAction,
    UserDataActionTypes,
} from './actions';
import { UserDataState } from './reducers';
import { UserDataService } from './user-data.service';


@Injectable()
export class UserDataEffects {
    @Effect()
    load: Observable<Action> = this.actions.pipe(
        ofType(UserDataActionTypes.LOAD),
        switchMap(() => this.userDataService.readUserData()),
        map(userData => new LoadUserDataCompleteAction({ userData })),
    );

    @Effect()
    save: Observable<Action> = this.actions.pipe(
        ofType(UserDataActionTypes.SAVE),
        mergeMap(() => this.store.pipe(
            select(state => state.userData),
            take(1),
        )),
        switchMap((userDataState: UserDataState) =>
            this.userDataService
                .writeUserData(userDataState.data)
                .pipe(
                    map(() => new SaveUserDataCompleteAction()),
                    catchError(error => of(new SaveUserDataErrorAction(error))),
                ),
        ),
    );

    constructor(
        private readonly actions: Actions,
        private store: Store<AppState>,
        private userDataService: UserDataService,
    ) {}
}
