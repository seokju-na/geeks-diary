import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, debounceTime, filter, map, switchMap } from 'rxjs/operators';
import {
    LoadCommitHistoryAction,
    LoadCommitHistoryFailAction,
    UpdateFileChangesAction,
    UpdateFileChangesErrorAction,
    VcsActionTypes,
} from './vcs.actions';
import { VcsService } from './vcs.service';


export const VCS_DETECT_CHANGES_THROTTLE_TIME = 250;

export const VCS_DETECT_CHANGES_EFFECT_ACTIONS = new InjectionToken<any[]>('VcsDetectChangesEffectActions');

export const VCS_HISTORY_CHANGED_THROTTLE_TIME = 250;

export const VCS_HISTORY_CHANGED_EFFECT_ACTIONS = new InjectionToken<any[]>('VcsHistoryChangedEffectActions');


@Injectable()
export class VcsEffects {
    readonly detectChangesEffectActions: any[];
    readonly historyChangedEffectActions: any[];

    @Effect()
    detectChanges = this.actions.pipe(
        filter(action => this.detectChangesEffectActions.some(type => action.type === type)),
        debounceTime(VCS_DETECT_CHANGES_THROTTLE_TIME),
        switchMap(() => this.vcsService.fetchFileChanges()),
        map(fileChanges => new UpdateFileChangesAction({ fileChanges })),
        catchError(error => of(new UpdateFileChangesErrorAction(error))),
    );

    @Effect()
    historyChanged = this.actions.pipe(
        filter(action => this.historyChangedEffectActions.some(type => action.type === type)),
        debounceTime(VCS_HISTORY_CHANGED_THROTTLE_TIME),
        switchMap(() => this.vcsService.fetchCommitHistory()),
        map(history => new LoadCommitHistoryAction({
            history,
            allLoaded: history.length < this.vcsService.commitHistoryFetchingSize,
        })),
        catchError(error => of(new LoadCommitHistoryFailAction(error))),
    );

    constructor(
        private actions: Actions,
        private vcsService: VcsService,
        @Optional() @Inject(VCS_DETECT_CHANGES_EFFECT_ACTIONS) detectChangesEffectActions: any[],
        @Optional() @Inject(VCS_HISTORY_CHANGED_EFFECT_ACTIONS) historyChangedEffectActions: any[],
    ) {
        this.detectChangesEffectActions = (detectChangesEffectActions || []).concat([
            VcsActionTypes.COMMITTED,
            VcsActionTypes.SYNCHRONIZED,
        ]);

        this.historyChangedEffectActions = (historyChangedEffectActions || []).concat([
            VcsActionTypes.COMMITTED,
            VcsActionTypes.SYNCHRONIZED,
        ]);
    }
}
