import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormFieldErrorComponent } from '../../src/browser/ui/form-field';


export function getVisibleErrorAt(debugElement: DebugElement): FormFieldErrorComponent | null {
    const findResult = debugElement
        .queryAll(By.directive(FormFieldErrorComponent))
        .find(error => (error.componentInstance as FormFieldErrorComponent).show);

    if (findResult) {
        return findResult.componentInstance as FormFieldErrorComponent;
    } else {
        return null;
    }
}
