import { Action } from '@ngrx/store';
import { VcsCommitItem, VcsFileChange } from '../../core/vcs';


export enum VcsActionTypes {
    UPDATE_FILE_CHANGES = '[Vcs] Update file changes',
    UPDATE_FILE_CHANGES_FAIL = '[Vcs] Update file changes fail',
    COMMITTED = '[Vcs] Committed',
    LOAD_COMMIT_HISTORY = '[Vcs] Load commit history',
    LOAD_MORE_COMMIT_HISTORY = '[Vcs] Load more commit history',
    LOAD_COMMIT_HISTORY_FAIL = '[Vcs] Load commit history fail',
    SYNCHRONIZED = '[Vcs] Synchronized',
    SYNCHRONIZED_FAIL = '[Vcs] Synchronized fail',
}


export class UpdateFileChangesAction implements Action {
    readonly type = VcsActionTypes.UPDATE_FILE_CHANGES;

    constructor(public readonly payload: { fileChanges: VcsFileChange[] }) {
    }
}


export class UpdateFileChangesErrorAction implements Action {
    readonly type = VcsActionTypes.UPDATE_FILE_CHANGES_FAIL;

    constructor(public errors?: any) {
    }
}


export class CommittedAction implements Action {
    readonly type = VcsActionTypes.COMMITTED;

    constructor(public readonly payload: { commitId: string }) {
    }
}


export class LoadCommitHistoryAction implements Action {
    readonly type = VcsActionTypes.LOAD_COMMIT_HISTORY;

    constructor(public readonly payload: {
        history: VcsCommitItem[],
        allLoaded: boolean,
    }) {
    }
}


export class LoadMoreCommitHistoryAction implements Action {
    readonly type = VcsActionTypes.LOAD_MORE_COMMIT_HISTORY;

    constructor(public readonly payload: {
        history: VcsCommitItem[],
        allLoaded: boolean,
    }) {
    }
}


export class LoadCommitHistoryFailAction implements Action {
    readonly type = VcsActionTypes.LOAD_COMMIT_HISTORY_FAIL;

    constructor(public readonly error?: any) {
    }
}


export class SynchronizedAction implements Action {
    readonly type = VcsActionTypes.SYNCHRONIZED;
}


export class SynchronizedFailAction implements Action {
    readonly type = VcsActionTypes.SYNCHRONIZED_FAIL;

    constructor(public readonly error?: any) {
    }
}


export type VcsAction =
    UpdateFileChangesAction
    | UpdateFileChangesErrorAction
    | CommittedAction
    | LoadCommitHistoryAction
    | LoadMoreCommitHistoryAction
    | LoadCommitHistoryFailAction
    | SynchronizedAction
    | SynchronizedFailAction;
