import { VcsFileStatus } from './models';
import { VcsRepositoryActions, VcsRepositoryActionTypes } from './vcs-repository.actions';


export interface VcsRepositoryState {
    loading: boolean;
    loaded: boolean;
    fileStatues: VcsFileStatus[];
}


export function createInitialVcsRepositoryState(): VcsRepositoryState {
    return {
        loading: false,
        loaded: false,
        fileStatues: [],
    };
}


export function vcsRepositoryReducer(
    state = createInitialVcsRepositoryState(),
    action: VcsRepositoryActions,
): VcsRepositoryState {

    switch (action.type) {
        case VcsRepositoryActionTypes.GET_FILE_STATUES:
            return {
                ...state,
                loading: true,
            };

        case VcsRepositoryActionTypes.GET_FILE_STATUES_COMPLETE:
            return {
                ...state,
                loading: false,
                loaded: true,
                fileStatues: [...action.payload.statues],
            };

        case VcsRepositoryActionTypes.GET_FILE_STATUES_ERROR:
            return {
                ...state,
                loading: false,
            };

        default:
            return state;
    }
}
