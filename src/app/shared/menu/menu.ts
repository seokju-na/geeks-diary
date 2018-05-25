import { Injectable, NgZone } from '@angular/core';
import { MenuRef } from './menu-ref';


@Injectable()
export class Menu {
    private openMenus: MenuRef[] = [];

    constructor(private ngZone: NgZone) {
    }

    open(
        template: Electron.MenuItemConstructorOptions[],
        options?: Electron.PopupOptions,
    ): MenuRef {

        const menuRef = new MenuRef(template, options);
        menuRef.setNgZone(this.ngZone);

        this.openMenus.push(menuRef);
        menuRef.afterClosed().subscribe(() => this.removeOpenMenu(menuRef));

        return menuRef;
    }

    private removeOpenMenu(menuRef: MenuRef) {
        const index = this.openMenus.indexOf(menuRef);

        if (index > -1) {
            this.openMenus.splice(index, 1);
        }
    }
}
