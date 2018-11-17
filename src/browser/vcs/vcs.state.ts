import { VcsFileChange } from '../../core/vcs';


export function createVcsInitialState(): VcsState {
    return {
        fileChanges: [],
    };
}


export interface VcsState {
    readonly fileChanges: VcsFileChange[];
}


export interface VcsStateWithRoot {
    vcs: {
        vcs: VcsState;
    };
}
