import { Component, Input } from '@angular/core';


@Component({
    selector: 'gd-form-field-error',
    templateUrl: './form-field-error.component.html',
    styleUrls: ['./form-field-error.component.less'],
})
export class FormFieldErrorComponent {
    @Input() errorName: string;
    @Input() show = false;
}
