import { ElementRef } from '@angular/core';
import { FormGroupDirective, NgControl, ValidationErrors } from '@angular/forms';
import { combineLatest, Observable } from 'rxjs';


export abstract class FormFieldControl {
    abstract id: string;

    readonly ngControl: NgControl;
    readonly parentForm?: FormGroupDirective;
    readonly elementRef?: ElementRef;

    disabled?: boolean;
    focused?: boolean;

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
