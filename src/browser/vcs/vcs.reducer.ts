import { ActionReducerMap } from '@ngrx/store';
import { VcsAction, VcsActionTypes } from './vcs.actions';
import { createVcsInitialState, VcsState } from './vcs.state';


export function vcsReducer(
    state: VcsState = createVcsInitialState(),
    action: VcsAction,
): VcsState {
    switch (action.type) {
        case VcsActionTypes.UPDATE_FILE_CHANGES:
            return {
                ...state,
                fileChanges: [...action.payload.fileChanges],
            };
        default:
            return state;
    }
}


export const vcsReducerMap: ActionReducerMap<{ vcs: VcsState }> = {
    vcs: vcsReducer,
};
