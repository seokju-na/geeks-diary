import { Action } from '@ngrx/store';
import { VcsFileChange } from '../../core/vcs';


export enum VcsActionTypes {
    UPDATE_FILE_CHANGES = '[Vcs] Update file changes',
}


export class UpdateFileChangesAction implements Action {
    readonly type = VcsActionTypes.UPDATE_FILE_CHANGES;

    constructor(public readonly payload: { fileChanges: VcsFileChange[] }) {
    }
}


export type VcsAction =
    UpdateFileChangesAction;
