import { Directive } from '@angular/core';


/**
 * Use label for 'gd-form-field' component.
 *
 * @example
 * <gd-form-field-label for="exampleInput">Name:</gd-form-field-label>
 * <gd-form-field>
 *     <input gdInput formControlName="example" id="exampleInput">
 * </gd-form-field>
 */
@Directive({
    selector: 'label[gdFormFieldLabel]',
    host: {
        'class': 'FormFieldLabel',
    },
})
export class FormFieldLabelDirective {
}
