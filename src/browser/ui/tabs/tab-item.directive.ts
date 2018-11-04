import { FocusableOption } from '@angular/cdk/a11y';
import { Directive, ElementRef, Input } from '@angular/core';


@Directive({
    selector: '[gdTabItem]',
    host: {
        'class': 'TabItem',
        '[class.TabItem--activate]': 'active',
    },
})
export class TabItemDirective implements FocusableOption {
    @Input() active: boolean = false;

    constructor(public _elementRef: ElementRef<HTMLElement>) {
    }

    focus(): void {
        this._elementRef.nativeElement.focus();
    }
}
