import { NgZone } from '@angular/core';
import { remote } from 'electron';
import { Observable, Subject } from 'rxjs';


let uniqueId = 0;

const { Menu } = remote;


export class MenuRef {
    readonly id: string = `Menu-${uniqueId++}`;

    private readonly _beforeOpen = new Subject<Event>();
    private readonly _beforeClose = new Subject<Event>();
    private readonly _afterClosed = new Subject<Electron.MenuItem | null>();
    private readonly _menu: Electron.Menu;
    private _clickedMenuItem: Electron.MenuItem | null = null;

    private ngZone: NgZone;

    constructor(
        template: Electron.MenuItemConstructorOptions[],
        options: Electron.PopupOptions = {},
    ) {

        const assignClickCallback = (items: Electron.MenuItemConstructorOptions[]) => {
            items.forEach((item) => {
                if (item.type === 'submenu') {
                    assignClickCallback(item.submenu as Electron.MenuItemConstructorOptions[]);
                }

                const ref = this;

                item.click = (menuItem) => {
                    ref._clickedMenuItem = menuItem;
                };
            });
        };

        assignClickCallback(template);

        this._menu = Menu.buildFromTemplate(template);

        this._menu.on('menu-will-show', (event: Event) => {
            this.ngZone.run(() => {
                this._beforeOpen.next(event);
            });
        });

        this._menu.on('menu-will-close', (event: Event) => {
            this.ngZone.run(() => {
                this._beforeClose.next(event);
            });
        });

        options.callback = () => {
            this.ngZone.run(() => {
                this._afterClosed.next(this._clickedMenuItem);
            });
        };

        this._menu.popup(options);
    }

    setNgZone(ngZone: NgZone): void {
        this.ngZone = ngZone;
    }

    close(): void {
        this._menu.closePopup();
    }

    beforeOpen(): Observable<Event> {
        return this._beforeOpen.asObservable();
    }

    beforeClose(): Observable<Event> {
        return this._beforeClose.asObservable();
    }

    afterClosed(): Observable<Electron.MenuItem | null> {
        return this._afterClosed.asObservable();
    }
}
