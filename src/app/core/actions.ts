import { Action } from '@ngrx/store';


export enum LayoutActionTypes {
    TOGGLE_SIDEBAR = '[Layout] Toggle sidebar',
    CLOSE_SIDEBAR = '[Layout] Close sidebar',
}


export class ToggleSidebarAction implements Action {
    readonly type = LayoutActionTypes.TOGGLE_SIDEBAR;

    constructor(readonly activeOutletName: string) {
    }
}


export type LayoutActions =
    ToggleSidebarAction;
