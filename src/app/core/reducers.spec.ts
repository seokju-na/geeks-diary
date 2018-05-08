import { ToggleSidebarAction } from './actions';
import { layoutReducer } from './reducers';


describe('app.core.reducers.layoutReducer', () => {
    describe('TOGGLE_SIDEBAR', () => {
        it('should show sidebar and active outlet ' +
            'if sidebar is not opened.', () => {

            const action = new ToggleSidebarAction({
                outletName: 'test-outlet',
            });

            const state = layoutReducer(undefined, action);

            expect(state.showSidebar).toBe(true);
            expect(state.activeSidebarOutletName).toEqual('test-outlet');
        });

        it('should hide sidebar and deactive ' +
            'if active outlet name is same which wants to toggle.', () => {

            const action = new ToggleSidebarAction({
                outletName: 'test-outlet',
            });

            let state = layoutReducer(undefined, action);

            expect(state.showSidebar).toBe(true);
            expect(state.activeSidebarOutletName).toEqual('test-outlet');

            state = layoutReducer(state, action);

            expect(state.showSidebar).toBe(false);
            expect(state.activeSidebarOutletName).toBeNull();
        });

        it('should change active outlet ' +
            'if active outlet name is not same which wants to toggle.', () => {

            const action = new ToggleSidebarAction({
                outletName: 'test-outlet',
            });

            let state = layoutReducer(undefined, action);

            expect(state.showSidebar).toBe(true);
            expect(state.activeSidebarOutletName).toEqual('test-outlet');

            const nextAction = new ToggleSidebarAction({
                outletName: 'next-outlet',
            });

            state = layoutReducer(state, nextAction);

            expect(state.showSidebar).toBe(true);
            expect(state.activeSidebarOutletName).toEqual('next-outlet');
        });
    });
});
