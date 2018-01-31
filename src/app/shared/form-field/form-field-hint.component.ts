import { Component, Input } from '@angular/core';


@Component({
    selector: 'gd-form-field-hint',
    templateUrl: './form-field-hint.component.html',
    styleUrls: ['./form-field-hint.component.less']
})
export class FormFieldHintComponent {
    @Input() show = true;
}
