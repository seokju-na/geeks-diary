/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { FocusableOption, FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostListener,
    Inject,
    Input,
    OnDestroy,
    Optional,
    ViewEncapsulation,
} from '@angular/core';
import { Subject } from 'rxjs';
import { MenuItem } from './menu-item';
import { MENU_PANEL, MenuPanel } from './menu-panel';


let uniqueId = 0;


@Component({
    selector: '[gd-menu-item]',
    templateUrl: './menu-item.component.html',
    styleUrls: ['./menu-item.component.scss'],
    exportAs: 'gdMenuItem',
    host: {
        'role': 'menuitem',
        'class': 'MenuItem',
        '[class.MenuItem--highlighted]': '_highlighted',
        '[class.MenuItem--submenuTrigger]': '_triggersSubmenu',
        '[attr.tabindex]': '_getTabIndex()',
        '[attr.disabled]': 'disabled || null',
        '[attr.aria-disabled]': 'disabled.toString()',
        '[attr.id]': 'id',
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class MenuItemComponent implements MenuItem, FocusableOption, OnDestroy {
    /** Stream that emits when the menu item is hovered. */
    readonly _hovered = new Subject<MenuItemComponent>();

    /** Whether the menu item is highlighted. */
    _highlighted: boolean = false;

    /** Whether the menu item acts as a trigger for a sub-menu. */
    _triggersSubmenu: boolean = false;

    @Input() id = `gd-menu-item-${uniqueId++}`;
    @Input() iconName: string;

    constructor(
        private elementRef: ElementRef<HTMLElement>,
        private focusMonitor: FocusMonitor,
        @Optional() @Inject(MENU_PANEL) private parentMenu?: MenuPanel<MenuItemComponent>,
    ) {
        focusMonitor.monitor(this.elementRef.nativeElement, false);

        if (parentMenu && parentMenu.addItem) {
            parentMenu.addItem(this);
        }
    }

    private _disabled: boolean = false;

    @Input()
    get disabled() {
        return this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value);
    }

    get label(): string {
        return this.getLabel();
    }

    ngOnDestroy(): void {
        this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);

        if (this.parentMenu && this.parentMenu.removeItem) {
            this.parentMenu.removeItem(this);
        }

        this._hovered.complete();

    }

    /** Focuses the menu item. */
    focus(origin: FocusOrigin = 'program'): void {
        if (this.focusMonitor) {
            this.focusMonitor.focusVia(this.elementRef.nativeElement, origin);
        } else {
            this.elementRef.nativeElement.focus();
        }
    }

    /** Used to set the `tabindex`. */
    _getTabIndex(): string {
        return this.disabled ? '-1' : '0';
    }

    /** Prevents the default element actions if it is disabled. */
    @HostListener('click', ['$event'])
    _checkDisabled(event: Event): void {
        if (this.disabled) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    /** Emits to the hover stream. */
    @HostListener('mouseenter')
    _handleMouseEnter() {
        this._hovered.next(this);
    }

    /** Gets the label to be used when determining whether the option should be focused. */
    getLabel(): string {
        const element: HTMLElement = this.elementRef.nativeElement;
        const textNodeType = document.TEXT_NODE;
        let output = '';

        if (element.childNodes) {
            const length = element.childNodes.length;

            // Go through all the top-level text nodes and extract their text.
            // We skip anything that's not a text node to prevent the text from
            // being thrown off by something like an icon.
            for (let i = 0; i < length; i++) {
                if (element.childNodes[i].nodeType === textNodeType) {
                    output += element.childNodes[i].textContent;
                }
            }
        }

        return output.trim();
    }

    toMenuItem(): MenuItem {
        return {
            id: this.id,
            iconName: this.iconName,
            label: this.label,
        };
    }
}
