import { ActionReducerMap } from '@ngrx/store';
import { appLayoutReducer } from './app-layout';
import { AppState } from './app.state';


export const appReducer: ActionReducerMap<AppState> = {
    layout: appLayoutReducer,
};
