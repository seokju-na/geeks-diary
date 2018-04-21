import { LayoutActions, LayoutActionTypes } from './actions';


export interface LayoutState {
    activeSidebarOutletName: string | null;
    showSidebar: boolean;
}


export function createInitialLayoutState(): LayoutState {
    return {
        activeSidebarOutletName: null,
        showSidebar: false,
    };
}


export function layoutReducer(
    state = createInitialLayoutState(),
    action: LayoutActions,
): LayoutState {

    switch (action.type) {
        case LayoutActionTypes.TOGGLE_SIDEBAR:
            const showSidebar = !state.showSidebar;

            return {
                ...state,
                activeSidebarOutletName: showSidebar
                    ? action.activeOutletName : null,
                showSidebar,
            };

        default:
            return state;
    }
}
