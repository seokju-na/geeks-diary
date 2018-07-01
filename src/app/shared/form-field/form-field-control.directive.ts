import { Directive, Optional, Self } from '@angular/core';
import { FormGroupDirective, NgControl, ValidationErrors } from '@angular/forms';
import { combineLatest, Observable } from 'rxjs';


@Directive({
    selector: 'input[gdFormFieldControl], select[gdFormFieldControl]',
})
export class FormFieldControlDirective {
    constructor(@Self() public ngControl: NgControl,
                @Optional() public parentForm: FormGroupDirective) {
    }

    get statusChanges(): Observable<any | null> {
        let statusChanges = this.ngControl.statusChanges;

        if (this.parentForm) {
            statusChanges = combineLatest(this.parentForm.statusChanges);
        }

        return statusChanges;
    }

    getErrors(): ValidationErrors | null {
        const errors = Object.assign({}, this.ngControl.errors);

        if (this.parentForm) {
            Object.assign(errors, this.parentForm.errors);
        }

        return errors;
    }
}
