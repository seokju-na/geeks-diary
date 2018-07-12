import { Directive, ElementRef } from '@angular/core';


/**
 * Simple line display UI directive.
 */
@Directive({
    selector: 'gd-horizontal-line, gd-vertical-line',
})
export class LineDirective {

    constructor(public _elementRef: ElementRef) {
        const hostEl = this.getHostElement();

        hostEl.classList.add('Line');

        if (hostEl.tagName === 'gd-horizontal-line'.toUpperCase()) {
            hostEl.classList.add('Line--horizontal');
        } else if (hostEl.tagName === 'gd-vertical-line'.toUpperCase()) {
            hostEl.classList.add('Line--horizontal');
        }
    }

    private getHostElement(): HTMLElement {
        return this._elementRef.nativeElement;
    }
}
