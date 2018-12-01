import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, debounceTime, filter, map, switchMap } from 'rxjs/operators';
import {
    NoteCollectionActionTypes,
    UpdateNoteContributionAction,
    UpdateNoteContributionFailAction,
} from './note-collection.actions';
import { NoteContributionService } from './note-contribution.service';


export const NOTE_CONTRIBUTION_UPDATED_THROTTLE_TIME = 250;

export const NOTE_CONTRIBUTION_UPDATED_EFFECT_ACTIONS =
    new InjectionToken<any[]>('NoteContributionUpdateEffectActions');


@Injectable()
export class NoteContributionEffects {
    readonly contributionUpdatedEffectActions: any[];

    @Effect()
    contributionUpdated = this.actions.pipe(
        filter(action => this.contributionUpdatedEffectActions.some(type => action.type === type)),
        debounceTime(NOTE_CONTRIBUTION_UPDATED_THROTTLE_TIME),
        switchMap(() => from(this.contributionService.measure())),
        map(contribution => new UpdateNoteContributionAction({ contribution })),
        catchError(error => of(new UpdateNoteContributionFailAction(error))),
    );

    constructor(
        private actions: Actions,
        private contributionService: NoteContributionService,
        @Optional() @Inject(NOTE_CONTRIBUTION_UPDATED_EFFECT_ACTIONS) contributionUpdatedEffectActions: any[],
    ) {
        this.contributionUpdatedEffectActions = (contributionUpdatedEffectActions || []).concat([
            NoteCollectionActionTypes.SELECT_MONTH_FILTER,
        ]);
    }
}
