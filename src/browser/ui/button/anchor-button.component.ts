import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Input, ViewEncapsulation } from '@angular/core';
import { ButtonBase } from './button-base';


@Component({
    selector: 'a[gd-button], a[gd-icon-button], a[gd-flat-button]',
    templateUrl: './button.component.html',
    styleUrls: ['./button.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[attr.tabindex]': 'disabled ? -1 : (tabIndex || 0)',
        '[attr.disabled]': 'disabled || null',
        '[attr.aria-disabled]': 'disabled.toString()',
    },
})
export class AnchorButtonComponent extends ButtonBase<HTMLAnchorElement> {
    @Input() disabled = false;

    /** Tabindex of the button. */
    @Input() tabIndex: number;

    constructor(elementRef: ElementRef<HTMLAnchorElement>) {
        super(elementRef);
    }

    @HostListener('click')
    private haltDisabledEvents(event: Event): void {
        // A disabled button shouldn't apply any actions
        if (this.disabled) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }
}
