import { MenuItemConstructorOptions, PopupOptions } from 'electron';
import { Menu } from '../../../src/browser/ui/menu/menu';
import { MockMenuRef } from './mock-menu-ref';


export class MockMenu extends Menu {
    static providersForTesting = [
        { provide: Menu, useClass: MockMenu },
    ];

    menuRef: MockMenuRef;
    template: MenuItemConstructorOptions[];
    options: PopupOptions;

    open(
        template: MenuItemConstructorOptions[],
        options: PopupOptions = {},
    ): any {
        this.template = template;
        this.options = options;
        this.menuRef = new MockMenuRef();

        return this.menuRef;
    }
}
