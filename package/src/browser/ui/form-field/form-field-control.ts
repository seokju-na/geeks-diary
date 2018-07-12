import { HostBinding } from '@angular/core';
import { FormGroupDirective, NgControl, ValidationErrors } from '@angular/forms';
import { combineLatest, Observable } from 'rxjs';


export abstract class FormFieldControl {
    abstract readonly id: string;

    @HostBinding('class.FormFieldControl') private baseClassName = true;

    protected constructor(
        public ngControl: NgControl,
        public parentForm?: FormGroupDirective,
    ) {

        if (!this.ngControl) {
            throw new Error('NgControl muse be provided!');
        }
    }

    get statusChanges(): Observable<any | null> {
        let statusChanges = this.ngControl.statusChanges;

        if (this.parentForm) {
            statusChanges = combineLatest(
                statusChanges,
                this.parentForm.statusChanges,
            );
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
