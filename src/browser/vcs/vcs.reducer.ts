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

        case VcsActionTypes.LOAD_COMMIT_HISTORY:
            return {
                ...state,
                history: [...action.payload.history],
                allHistoryLoaded: action.payload.allLoaded,
            };

        case VcsActionTypes.LOAD_MORE_COMMIT_HISTORY:
            return {
                ...state,
                history: [
                    ...state.history,
                    ...action.payload.history,
                ],
                allHistoryLoaded: action.payload.allLoaded,
            };

        default:
            return state;
    }
}


export const vcsReducerMap: ActionReducerMap<{ vcs: VcsState }> = {
    vcs: vcsReducer,
};
