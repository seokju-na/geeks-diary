import { Action } from '@ngrx/store';
import { UserData } from './models';


export enum LayoutActionTypes {
    TOGGLE_SIDEBAR = '[Layout] Toggle sidebar',
}


export enum UserDataActionTypes {
    LOAD = '[UserData] Load user data',
    LOAD_COMPLETE = '[UserData] Load user data complete',
    SAVE = '[UserData] Save user data',
    SAVE_COMPLETE = '[UserData] Save user data complete',
    SAVE_ERROR = '[UserData] Save user data error',
}


export class ToggleSidebarAction implements Action {
    readonly type = LayoutActionTypes.TOGGLE_SIDEBAR;

    constructor(readonly payload: { outletName: string }) {
    }
}


export class LoadUserDataAction implements Action {
    readonly type = UserDataActionTypes.LOAD;
}


export class LoadUserDataCompleteAction implements Action {
    readonly type = UserDataActionTypes.LOAD_COMPLETE;

    constructor(readonly payload: { userData: UserData }) {
    }
}


export class SaveUserDataAction implements Action {
    readonly type = UserDataActionTypes.SAVE;

    constructor(readonly payload: { userData: UserData }) {
    }
}


export class SaveUserDataCompleteAction implements Action {
    readonly type = UserDataActionTypes.SAVE_COMPLETE;
}


export class SaveUserDataErrorAction implements Action {
    readonly type = UserDataActionTypes.SAVE_ERROR;

    constructor(readonly error: any) {
    }
}


export type LayoutActions =
    ToggleSidebarAction;


export type UserDataActions =
    LoadUserDataAction
    | LoadUserDataCompleteAction
    | SaveUserDataAction
    | SaveUserDataCompleteAction;
