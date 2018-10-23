import { Injectable, NgZone } from '@angular/core';
import { MenuItemConstructorOptions, PopupOptions } from 'electron';
import { MenuRef } from './menu-ref';


@Injectable()
export class Menu {
    constructor(private ngZone: NgZone) {
    }

    open(
        template: MenuItemConstructorOptions[],
        options: PopupOptions = {},
    ): MenuRef {

        return new MenuRef(template, options, this.ngZone);
    }
}
