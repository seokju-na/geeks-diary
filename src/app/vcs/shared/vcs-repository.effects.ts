import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
    GetVcsRepositoryFileStatuesComplete,
    GetVcsRepositoryFileStatuesError,
    VcsRepositoryActionTypes,
} from './vcs-repository.actions';
import { VcsRepositoryService } from './vcs-repository.service';


@Injectable()
export class VcsRepositoryEffects {
    @Effect()
    getFileStatues: Observable<Action> = this.actions.pipe(
        ofType(VcsRepositoryActionTypes.GET_FILE_STATUES),
        switchMap(() =>
            this.vcsRepositoryService.getFileStatues().pipe(
                map(statues => new GetVcsRepositoryFileStatuesComplete({ statues })),
                catchError(error => of(new GetVcsRepositoryFileStatuesError(error))),
            ),
        ),
    );

    constructor(
        private readonly actions: Actions,
        private vcsRepositoryService: VcsRepositoryService,
    ) {
    }
}
