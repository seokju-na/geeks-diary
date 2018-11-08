import { TabControl } from './tab-control';


describe('browser.ui.tabs.TabControl', () => {
    let control: TabControl;

    beforeEach(() => {
        control = new TabControl([
            { name: 'Apple', value: 'apple' },
            { name: 'Banana', value: 'banana' },
            { name: 'Tomato', value: 'tomato' },
        ]);
    });

    describe('construct', () => {
        it('should make unique id when id was not provided.', () => {
            expect(/gd-tab-\d+/.test(control.tabs[0].id)).toBe(true);
            expect(/gd-tab-\d+/.test(control.tabs[1].id)).toBe(true);
        });

        it('should select first tab as active.', () => {
            expect(control.activeTabIndex).toEqual(0);
            expect(control.activateTab.value).toEqual('apple');
        });
    });

    describe('activateTabChanges', () => {
        it('should emit event when active tab changed.', () => {
            const callback = jasmine.createSpy('activate tab changes callback');
            const subscription = control.activateTabChanges.subscribe(callback);

            control.selectTabByIndex(1);

            expect(callback).toHaveBeenCalledWith(control.tabs[1]);
            subscription.unsubscribe();
        });
    });

    describe('selectFirstTab', () => {
        beforeEach(() => {
            control.selectTabByIndex(2);
        });

        it('should select first tab.', () => {
            control.selectFirstTab();
            expect(control.activeTabIndex).toEqual(0);
        });
    });

    describe('selectLastTab', () => {
        it('should select last tab.', () => {
            control.selectLastTab();
            expect(control.activeTabIndex).toEqual(2);
        });
    });

    describe('selectTabByIndex', () => {
        it('should select tab by index.', () => {
            control.selectTabByIndex(1);
            expect(control.activeTabIndex).toEqual(1);
        });

        it('should not select tab if index is not valid.', () => {
            control.selectTabByIndex(3);
            expect(control.activeTabIndex).toEqual(0);

            control.selectTabByIndex(-1);
            expect(control.activeTabIndex).toEqual(0);
        });
    });

    describe('selectTabByValue', () => {
        it('should select tab by value.', () => {
            control.selectTabByValue('tomato');
            expect(control.activeTabIndex).toEqual(2);
        });

        it('should not select tab if value is not valid.', () => {
            control.selectTabByValue('whats this?');
            expect(control.activeTabIndex).toEqual(0);
        });
    });

    describe('deselect', () => {
        it('should remove active tab.', () => {
            control.deselect();
            expect(control.activeTabIndex).toBeNull();
        });
    });
});
