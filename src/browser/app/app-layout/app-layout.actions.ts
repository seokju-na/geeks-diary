import { Action } from '@ngrx/store';


export enum AppLayoutActionTypes {
    TOGGLE_SIDENAV_PANEL = '[AppLayout] Toggle sidenav panel',
}


export class ToggleSidenavPanelAction implements Action {
    readonly type = AppLayoutActionTypes.TOGGLE_SIDENAV_PANEL;

    constructor(readonly payload: { outletId: string }) {
    }
}


export type AppLayoutAction =
    ToggleSidenavPanelAction;
