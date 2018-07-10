import { Directive, Optional, Self } from '@angular/core';
import { FormGroupDirective, NgControl } from '@angular/forms';
import { FormFieldControl } from '../form-field/form-field-control';


@Directive({
    selector: 'input[gdInput], textarea[gdInput]',
    providers: [{
        provide: FormFieldControl,
        useExisting: InputDirective,
    }],
})
export class InputDirective extends FormFieldControl {
    constructor(
        @Self() ngControl: NgControl,
        @Optional() parentForm: FormGroupDirective,
    ) {

        super(ngControl, parentForm);
    }
}
