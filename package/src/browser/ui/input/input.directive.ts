import { Directive, HostBinding, Input, Optional, Self } from '@angular/core';
import { FormGroupDirective, NgControl } from '@angular/forms';
import { FormFieldControl } from '../form-field/form-field-control';


let uniqueId = 0;


@Directive({
    selector: 'input[gdInput], textarea[gdInput]',
    providers: [{
        provide: FormFieldControl,
        useExisting: InputDirective,
    }],
})
export class InputDirective extends FormFieldControl {
    @HostBinding('class.Input') private className = true;

    @Input()
    get id() {
        return this._id;
    }
    set id(value) {
        this._id = value;
    }

    private _id = `gd-input-${uniqueId++}`;

    constructor(
        @Self() ngControl: NgControl,
        @Optional() parentForm: FormGroupDirective,
    ) {

        super(ngControl, parentForm);
    }
}
