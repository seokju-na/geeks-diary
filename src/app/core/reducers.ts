import { LayoutActions, LayoutActionTypes, UserDataActions, UserDataActionTypes } from './actions';


export interface LayoutState {
    activeSidebarOutletName: string | null;
    showSidebar: boolean;
}


export interface UserDataState {
    lastOpenedNoteId: string | null;
}


export function createInitialLayoutState(): LayoutState {
    return {
        activeSidebarOutletName: null,
        showSidebar: false,
    };
}


export function createInitialUserDataState(): UserDataState {
    return {
        lastOpenedNoteId: null,
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


export function userDataReducer(
    state = createInitialUserDataState(),
    action: UserDataActions,
): UserDataState {

    switch (action.type) {
        case UserDataActionTypes.LOAD_COMPLETE:
            return { ...action.payload.userData };

        default:
            return state;
    }
}
