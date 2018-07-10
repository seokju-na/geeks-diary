import { Action } from '@ngrx/store';
import { AppLayoutState } from './app-layout.state';


export enum AppLayoutActionTypes {
    INIT_STATE = '[AppLayout] Init state',
    TOGGLE_SIDENAV_PANEL = '[AppLayout] Toggle sidenav panel',
    RESIZE_SIDENAV_PANEL_WIDTH = '[AppLayout] Resize sidenav panel width',
}


export class InitAppLayoutStateAction implements Action {
    readonly type = AppLayoutActionTypes.INIT_STATE;

    constructor(readonly payload: { appLayoutState: Partial<AppLayoutState> }) {
    }
}


export class ToggleSidenavPanelAction implements Action {
    readonly type = AppLayoutActionTypes.TOGGLE_SIDENAV_PANEL;

    constructor(readonly payload: { tabId: string }) {
    }
}


export class ResizeSidenavPanelWidthAction implements Action {
    readonly type = AppLayoutActionTypes.RESIZE_SIDENAV_PANEL_WIDTH;

    constructor(readonly payload: { panelWidth: number }) {
    }
}


export type AppLayoutActions =
    InitAppLayoutStateAction
    | ToggleSidenavPanelAction
    | ResizeSidenavPanelWidthAction;
