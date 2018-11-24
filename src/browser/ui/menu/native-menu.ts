import { Injectable, NgZone } from '@angular/core';
import { MenuItemConstructorOptions, PopupOptions } from 'electron';
import { NativeMenuRef } from './native-menu-ref';


@Injectable()
export class NativeMenu {
    constructor(private ngZone: NgZone) {
    }

    open(
        template: MenuItemConstructorOptions[],
        options: PopupOptions = {},
    ): NativeMenuRef {

        return new NativeMenuRef(template, options, this.ngZone);
    }
}
