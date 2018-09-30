import { Directive } from '@angular/core';


/**
 * Label for form field.
 *
 * @example
 * <label gdFormFieldLabel for="someInput">Name:</label>
 * <gd-form-field>
 *     <input gdInput formControlName="some" id="someInput">
 * </gd-form-field>>
 */
@Directive({
    selector: 'label[gdFormFieldLabel]',
    host: {
        'class': 'FormFieldLabel',
    },
})
export class FormFieldLabelDirective {
}
