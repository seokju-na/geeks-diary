import { ActionReducer, ActionReducerMap, MetaReducer } from '@ngrx/store';
import { EnvironmentRunTarget } from '../environments/config';
import { environment } from '../environments/environment';
import { layoutReducer, LayoutState } from './core/reducers';


export interface AppState {
    layout: LayoutState;
}


export const appReducers: ActionReducerMap<AppState> = {
    layout: layoutReducer,
};


export function appLogger(reducer: ActionReducer<AppState>): ActionReducer<AppState> {
    return (state: AppState, action: any): AppState => {
        console.log('state', state);
        console.log('action', action);

        return reducer(state, action);
    };
}


export const appMetaReducers: MetaReducer<AppState>[] =
    environment.config.RUN_TARGET === EnvironmentRunTarget.DEVELOPMENT
        ? [appLogger]
        : [];
