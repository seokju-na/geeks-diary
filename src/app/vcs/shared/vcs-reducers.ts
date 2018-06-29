import { ActionReducerMap } from '@ngrx/store';
import { AppState } from '../../app-reducers';
import { vcsRepositoryReducer, VcsRepositoryState } from './vcs-repository.reducer';


export interface VcsStateForFeature {
    repository: VcsRepositoryState;
}


export interface VcsStateWithRoot extends AppState {
    vcs: VcsStateForFeature;
}


export const vcsReducerMap: ActionReducerMap<VcsStateForFeature> = {
    repository: vcsRepositoryReducer,
};
