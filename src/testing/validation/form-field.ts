import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormFieldErrorComponent } from '../../app/shared/form-field/form-field-error.component';


export function verifyFormFieldError(
    formElem: DebugElement,
    errorName: string,
    errorMessage?: string,
): void {

    const formFieldErrors = formElem.queryAll(
        By.directive(FormFieldErrorComponent));
    const target = formFieldErrors.find(elem => {
        const instance = <FormFieldErrorComponent>elem.componentInstance;
        return instance.errorName === errorName && instance.show;
    });

    if (!target) {
        throw new Error(`Cannot find FormFieldError for '${errorName}'.`);
    }

    if (errorMessage) {
        const content = target.query(By.css('.FormFieldError'));
        expect(content.nativeElement.innerText).toContain(errorMessage);
    }
}
