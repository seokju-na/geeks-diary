import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';


/**
 * Use label for 'gd-form-field' component.
 *
 * @example
 * <gd-form-field-label for="exampleInput">Name:</gd-form-field-label>
 * <gd-form-field>
 *     <input gdInput formControlName="example" id="exampleInput">
 * </gd-form-field>
 */
@Component({
    selector: 'gd-form-field-label',
    templateUrl: './form-field-label.component.html',
    styleUrls: ['./form-field-label.component.scss'],
    host: {
        'class': 'FormFieldLabel',
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class FormFieldLabelComponent {
    @Input('for') forAttr: string;
}
