import { Directive, ElementRef } from '@angular/core';


@Directive({
    selector: 'gd-horizontal-line, gd-vertical-line',
})
export class LineDirective {
    constructor(public _elementRef: ElementRef<HTMLElement>) {
        const hostEl = this._elementRef.nativeElement;

        hostEl.classList.add('Line');

        if (hostEl.tagName === 'gd-horizontal-line'.toUpperCase()) {
            hostEl.classList.add('Line--horizontal');
        } else if (hostEl.tagName === 'gd-vertical-line'.toUpperCase()) {
            hostEl.classList.add('Line--horizontal');
        }
    }
}
