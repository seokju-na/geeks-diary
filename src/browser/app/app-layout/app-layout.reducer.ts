import { AppLayoutAction, AppLayoutActionTypes } from './app-layout.actions';
import { AppLayoutState, createAppLayoutInitialState } from './app-layout.state';


export function appLayoutReducer(
    state: AppLayoutState = createAppLayoutInitialState(),
    action: AppLayoutAction,
): AppLayoutState {

    switch (action.type) {
        case AppLayoutActionTypes.TOGGLE_SIDENAV_PANEL:
            const showSidebar = state.showSidenavPanel === false
                || state.activeOutletId !== action.payload.outletId;

            return {
                ...state,
                activeOutletId: showSidebar ? action.payload.outletId : null,
                showSidenavPanel: showSidebar,
            };

        case AppLayoutActionTypes.RESIZE_SIDENAV_PANEL:
            return {
                ...state,
                sidenavPanelWidth: action.payload.width,
            };

        default:
            return state;
    }
}
