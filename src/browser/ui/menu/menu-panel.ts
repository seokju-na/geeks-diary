/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { FocusOrigin } from '@angular/cdk/a11y';
import { EventEmitter, InjectionToken, TemplateRef } from '@angular/core';
import { MenuPositionX, MenuPositionY } from './menu-positions';


export const MENU_PANEL = new InjectionToken<MenuPanel>('MenuPanel');


export interface MenuPanel<T = any> {
    xPosition: MenuPositionX;
    yPosition: MenuPositionY;
    closed: EventEmitter<void | 'click' | 'keydown' | 'tab'>;
    overlapTrigger: boolean;
    templateRef: TemplateRef<any>;
    parentMenu?: MenuPanel | undefined;
    focusFirstItem: (origin?: FocusOrigin) => void;
    resetActiveItem: () => void;
    setPositionClasses?: (x: MenuPositionX, y: MenuPositionY) => void;
    backdropClass?: string;
    hasBackdrop?: boolean;

    addItem?(item: T): void;

    removeItem?(item: T): void;
}
