import { Action } from '@ngrx/store';


export enum AppLayoutActionTypes {
    TOGGLE_SIDENAV_PANEL = '[AppLayout] Toggle sidenav panel',
    RESIZE_SIDENAV_PANEL = '[AppLayout] Resize sidenav panel',
}


export class ToggleSidenavPanelAction implements Action {
    readonly type = AppLayoutActionTypes.TOGGLE_SIDENAV_PANEL;

    constructor(readonly payload: { outletId: string }) {
    }
}


export class ResizeSidenavPanelAction implements Action {
    readonly type = AppLayoutActionTypes.RESIZE_SIDENAV_PANEL;

    constructor(readonly payload: { width: number }) {
    }
}


export type AppLayoutAction =
    ToggleSidenavPanelAction
    | ResizeSidenavPanelAction;
