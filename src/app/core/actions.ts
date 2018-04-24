import { Action } from '@ngrx/store';
import { UserDataState } from './reducers';


export enum LayoutActionTypes {
    TOGGLE_SIDEBAR = '[Layout] Toggle sidebar',
    CLOSE_SIDEBAR = '[Layout] Close sidebar',
}


export enum UserDataActionTypes {
    LOAD = '[UserData] Load',
    LOAD_COMPLETE = '[UserData] Load complete',
}


export class ToggleSidebarAction implements Action {
    readonly type = LayoutActionTypes.TOGGLE_SIDEBAR;

    constructor(readonly activeOutletName: string) {
    }
}


export class LoadUserDataAction implements Action {
    readonly type = UserDataActionTypes.LOAD;
}


export class LoadUserDataCompleteAction implements Action {
    readonly type = UserDataActionTypes.LOAD_COMPLETE;

    constructor(readonly payload: { userData: UserDataState }) {
    }
}


export type LayoutActions =
    ToggleSidebarAction;


export type UserDataActions =
    LoadUserDataAction
    | LoadUserDataCompleteAction;
