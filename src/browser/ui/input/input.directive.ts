import { Directive, ElementRef, HostListener, Input, Optional, Self } from '@angular/core';
import { FormGroupDirective, NgControl } from '@angular/forms';
import { FormFieldControl } from '../form-field/form-field-control';


let uniqueId = 0;


@Directive({
    selector: 'input[gdInput], textarea[gdInput]',
    providers: [
        {
            provide: FormFieldControl,
            useExisting: InputDirective,
        },
    ],
    host: {
        'class': 'Input',
        '[attr.id]': 'id',
    },
})
export class InputDirective extends FormFieldControl {
    private _id = `gd-input-${uniqueId++}`;

    @Input()
    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    constructor(
        @Self() public ngControl: NgControl,
        @Optional() public parentForm: FormGroupDirective,
        public elementRef: ElementRef,
    ) {
        super();
    }

    @HostListener('focus')
    private handleFocus(): void {
        this.focused = true;
    }

    @HostListener('blur')
    private handleBlur(): void {
        this.focused = false;
    }
}
