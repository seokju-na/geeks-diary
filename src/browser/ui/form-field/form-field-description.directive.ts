import { Directive } from '@angular/core';


@Directive({
    selector: 'gd-form-field-description',
    host: {
        'class': 'FormFieldDescription',
    },
})
export class FormFieldDescriptionDirective {
}
