import { Directive, Optional, Self } from '@angular/core';
import { FormGroupDirective, NgControl, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { combineLatest } from 'rxjs/operators';


@Directive({
    selector: 'input[gdFormFieldControl], select[gdFormFieldControl]',
})
export class FormFieldControlDirective {
    constructor(@Self() public ngControl: NgControl,
                @Optional() public parentForm: FormGroupDirective) {
    }

    get statusChanges(): Observable<any | null> {
        const statusChanges = this.ngControl.statusChanges;

        if (this.parentForm) {
            statusChanges.pipe(combineLatest(this.parentForm.statusChanges));
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
