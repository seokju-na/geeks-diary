import {
    LayoutActions,
    LayoutActionTypes,
    UserDataActions,
    UserDataActionTypes,
} from './actions';
import { UserData } from './models';


export interface LayoutState {
    activeSidebarOutletName: string | null;
    showSidebar: boolean;
}


export interface UserDataState extends UserData {
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
            const showSidebar = state.showSidebar === false
                || state.activeSidebarOutletName !== action.payload.outletName;

            return {
                ...state,
                activeSidebarOutletName: showSidebar
                    ? action.payload.outletName
                    : null,
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
