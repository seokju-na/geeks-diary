import { Action } from '@ngrx/store';
import { VcsFileStatus } from './models';


export enum VcsRepositoryActionTypes {
    GET_FILE_STATUES = '[VcsRepository] Get file statues',
    GET_FILE_STATUES_COMPLETE = '[VcsRepository] Get file statues complete',
    GET_FILE_STATUES_ERROR = '[VcsRepository] Get file statues error',
}


export class GetVcsRepositoryFileStatues implements Action {
    readonly type = VcsRepositoryActionTypes.GET_FILE_STATUES;
}


export class GetVcsRepositoryFileStatuesComplete implements Action {
    readonly type = VcsRepositoryActionTypes.GET_FILE_STATUES_COMPLETE;

    constructor(readonly payload: { statues: VcsFileStatus[] }) {
    }
}


export class GetVcsRepositoryFileStatuesError implements Action {
    readonly type = VcsRepositoryActionTypes.GET_FILE_STATUES_ERROR;

    constructor(readonly error?: any) {
    }
}


export type VcsRepositoryActions =
    GetVcsRepositoryFileStatues
    | GetVcsRepositoryFileStatuesComplete
    | GetVcsRepositoryFileStatuesError;
