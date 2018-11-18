import { NgZone } from '@angular/core';
import { Menu, MenuItem, MenuItemConstructorOptions, PopupOptions, remote } from 'electron';
import { Observable, Subject } from 'rxjs';


let uniqueId = 0;


interface MenuItemWithId extends MenuItem {
    id?: string;
}


export class NativeMenuRef {
    readonly id: string = `native-menu-${uniqueId++}`;
    private readonly _menu: Menu;
    private _clickedMenuItem: MenuItemWithId | null = null;

    private readonly _afterClosed = new Subject<MenuItemWithId | null>();

    constructor(
        template: MenuItemConstructorOptions[],
        options: PopupOptions,
        private ngZone: NgZone,
    ) {

        this._menu = remote.Menu.buildFromTemplate(
            this._templateWithCallback(template),
        );

        options.callback = () => {
            this.ngZone.run(() => {
                this._afterClosed.next(this._clickedMenuItem);
            });
        };

        this._menu.popup(options);
    }

    close(): void {
        this._menu.closePopup();
    }

    afterClosed(): Observable<MenuItemWithId | null> {
        return this._afterClosed.asObservable();
    }

    private _templateWithCallback(
        template: MenuItemConstructorOptions[],
    ): MenuItemConstructorOptions[] {

        const cloned = [...template];

        cloned.forEach((item) => {
            if (item.type === 'submenu' && item.submenu) {
                item.submenu = this._templateWithCallback(
                    item.submenu as MenuItemConstructorOptions[],
                );
            }

            const ref = this;

            item.click = (menuItem) => {
                ref._clickedMenuItem = menuItem;
            };
        });

        return cloned;
    }
}
