import { ActionReducerMap } from '@ngrx/store';
import {
    layoutReducer,
    LayoutState,
    userDataReducer,
    UserDataState,
} from './core/reducers';


export interface AppState {
    layout: LayoutState;
    userData: UserDataState;
}


export const appReducers: ActionReducerMap<AppState> = {
    layout: layoutReducer,
    userData: userDataReducer,
};
