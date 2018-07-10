import { AppLayoutActions, AppLayoutActionTypes } from './app-layout.actions';
import { AppLayoutState, createAppLayoutInitialState } from './app-layout.state';


export function appLayoutReducer(
    state: AppLayoutState = createAppLayoutInitialState(),
    action: AppLayoutActions,
): AppLayoutState {

    switch (action.type) {
        case AppLayoutActionTypes.INIT_STATE:
            return {
                ...state,
                ...action.payload.appLayoutState,
            };

        case AppLayoutActionTypes.TOGGLE_SIDENAV_PANEL:
            const showSidebar = state.showSidenavPanel === false
                || state.activeTabId !== action.payload.tabId;

            return {
                ...state,
                activeTabId: showSidebar ? action.payload.tabId : null,
                showSidenavPanel: showSidebar,
            };

        case AppLayoutActionTypes.RESIZE_SIDENAV_PANEL_WIDTH:
            return {
                ...state,
                sidenavPanelWidth: action.payload.panelWidth,
            };

        default:
            return state;
    }
}
