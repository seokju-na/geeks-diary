import { ToggleSidenavPanelAction } from './app-layout.actions';
import { appLayoutReducer } from './app-layout.reducer';
import { AppLayoutState, createAppLayoutInitialState } from './app-layout.state';


describe('browser.app.appLayout.reducer', () => {
    describe('TOGGLE_SIDENAV_PANEL', () => {
        it('should open panel with outlet ID if panel is closed in current state.', () => {
            const beforeState: AppLayoutState = {
                ...createAppLayoutInitialState(),
                showSidenavPanel: false,
            };

            const afterState = appLayoutReducer(
                beforeState,
                new ToggleSidenavPanelAction({ outletId: 'some-outlet' }),
            );

            expect(afterState.activeOutletId).toEqual('some-outlet');
            expect(afterState.showSidenavPanel).toBe(true);
        });

        it('should open panel with outlet ID if id is different with current opened '
            + 'outlet id.', () => {
            const beforeState = appLayoutReducer(
                undefined,
                new ToggleSidenavPanelAction({ outletId: 'some-outlet' }),
            );

            const afterState = appLayoutReducer(
                beforeState,
                new ToggleSidenavPanelAction({ outletId: 'other-outlet' }),
            );

            expect(afterState.activeOutletId).toEqual('other-outlet');
            expect(afterState.showSidenavPanel).toBe(true);
        });

        it('should close panel if outlet id is same with current opened outlet id.', () => {
            const beforeState = appLayoutReducer(
                undefined,
                new ToggleSidenavPanelAction({ outletId: 'some-outlet' }),
            );

            const afterState = appLayoutReducer(
                beforeState,
                new ToggleSidenavPanelAction({ outletId: 'some-outlet' }),
            );

            expect(afterState.activeOutletId).toBeNull();
            expect(afterState.showSidenavPanel).toBe(false);
        });
    });
});
