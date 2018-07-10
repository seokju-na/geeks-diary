export interface AppLayoutState {
    /** Id will be service id. */
    activeTabId: string | null;
    showSidenavPanel: boolean;
    sidenavPanelWidth: number | null;
}


export function createAppLayoutInitialState(): AppLayoutState {
    return {
        activeTabId: null,
        showSidenavPanel: false,
        sidenavPanelWidth: null,
    };
}
