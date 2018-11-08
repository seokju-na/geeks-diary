import { Type } from '@angular/core';


// Types
export interface AppLayoutSidenavOutlet {
    id: string;
    name: string;
    iconName: string;
    shortcut: string;
    description: string;
    outletComponent: Type<any>;
}


// State
export interface AppLayoutState {
    activeOutletId: string | null;
    showSidenavPanel: boolean;
}


export function createAppLayoutInitialState(): AppLayoutState {
    return {
        activeOutletId: null,
        showSidenavPanel: false,
    };
}
