import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Component, ElementRef, Input } from '@angular/core';
import { removeDomStyle, updateDomStyles } from '../../utils/dom-style';


let uniqueId = 0;


@Component({
    selector: 'gd-form-field-error',
    template: '<ng-content></ng-content>',
    host: {
        'class': 'FormFieldError',
        'role': 'alert',
        '[attr.id]': 'id',
    },
})
export class FormFieldErrorComponent {
    @Input() id: string = `gd-form-field-error-${uniqueId++}`;
    @Input() errorName: string;

    constructor(private elementRef: ElementRef<HTMLElement>) {
    }

    private _show: boolean = false;

    @Input()
    get show(): boolean {
        return this._show;
    }

    set show(value: boolean) {
        this._show = coerceBooleanProperty(value);
        this.updateErrorVisibility();
    }

    private updateErrorVisibility(): void {
        if (this._show) {
            updateDomStyles(this.elementRef.nativeElement, {
                display: 'block',
            });
        } else {
            removeDomStyle(this.elementRef.nativeElement, 'display');
        }
    }
}
