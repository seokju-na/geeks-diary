import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation } from '@angular/core';
import { ButtonBase } from './button-base';




@Component({
    selector: 'button[gd-button], button[gd-icon-button], button[gd-flat-button]',
    templateUrl: './button.component.html',
    styleUrls: ['./button.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'class': 'Button',
    },
})
export class ButtonComponent extends ButtonBase<HTMLButtonElement> {
    constructor(elementRef: ElementRef<HTMLButtonElement>) {
        super(elementRef);
    }
}
