import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as path from 'path';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, mapTo, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LoadUserDataCompleteAction, UserDataActionTypes } from './actions';
import { FsService } from './fs.service';
import { createInitialUserDataState, UserDataState } from './reducers';


@Injectable()
export class UserDataEffects {
    readonly dataFileName = path.resolve(
        environment.getPath('userData'), 'user-data.json');

    @Effect()
    load = this.actions.pipe(
        ofType(UserDataActionTypes.LOAD),
        switchMap(() =>
            this.isUserDataFileExists().pipe(
                switchMap((exists) => {
                    if (!exists) {
                        return this.createDefaultDataFile();
                    }

                    return this.fsService.readFile(this.dataFileName).pipe(
                        map((buf: Buffer) => JSON.parse(buf.toString())),
                        catchError(() => this.createDefaultDataFile()),
                    );
                }),
                map(userData =>
                    new LoadUserDataCompleteAction({ userData })),
            ),
        ),
    );

    constructor(
        private readonly actions: Actions,
        private fsService: FsService,
    ) {}

    private isUserDataFileExists(): Observable<boolean> {
        return this.fsService
            .access(this.dataFileName)
            .pipe(
                mapTo(true),
                catchError(() => of(false)),
            );
    }

    private createDefaultDataFile(): Observable<UserDataState> {
        const initialUserData = createInitialUserDataState();

        return this.fsService
            .writeFile(this.dataFileName, JSON.stringify(initialUserData))
            .pipe(map(() => initialUserData));
    }
}
