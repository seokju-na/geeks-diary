import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, debounceTime, filter, map, switchMap } from 'rxjs/operators';
import { UpdateFileChangesAction, UpdateFileChangesErrorAction } from './vcs.actions';
import { VcsService } from './vcs.service';


export const VCS_DETECT_CHANGES_THROTTLE_TIME = 250;

export const VCS_DETECT_CHANGES_EFFECT_ACTIONS = new InjectionToken<any[]>('VcsDetectChangesEffectActions');


@Injectable()
export class VcsEffects {
    readonly detectChangesEffectActions: any[];

    @Effect()
    detectChanges = this.actions.pipe(
        filter((action: Action) => this.detectChangesEffectActions.some(type => action.type === type)),
        debounceTime(VCS_DETECT_CHANGES_THROTTLE_TIME),
        switchMap(() => this.vcsService.fetchFileChanges()),
        map(fileChanges => new UpdateFileChangesAction({ fileChanges })),
        catchError(error => of(new UpdateFileChangesErrorAction(error))),
    );

    constructor(
        private actions: Actions,
        private vcsService: VcsService,
        @Optional() @Inject(VCS_DETECT_CHANGES_EFFECT_ACTIONS) effectActions: any[],
    ) {
        this.detectChangesEffectActions = effectActions || [];
    }
}
