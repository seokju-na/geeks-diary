import { VcsCommitItem, VcsFileChange } from '../../core/vcs';


export function createVcsInitialState(): VcsState {
    return {
        fileChanges: [],
        history: [],
        allHistoryLoaded: false,
    };
}


export interface VcsState {
    readonly fileChanges: VcsFileChange[];
    readonly history: VcsCommitItem[];
    readonly allHistoryLoaded: boolean;
}


export interface VcsStateWithRoot {
    vcs: {
        vcs: VcsState;
    };
}
