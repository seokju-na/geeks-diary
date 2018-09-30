import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormFieldErrorComponent } from './form-field-error.component';
import { FormFieldComponent } from './form-field.component';
import { FormFieldLabelDirective } from './form-field-label.directive';
import { FormFieldDescriptionDirective } from './form-field-description.directive';


@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
    ],
    declarations: [
        FormFieldComponent,
        FormFieldLabelDirective,
        FormFieldErrorComponent,
        FormFieldDescriptionDirective,
    ],
    exports: [
        FormFieldComponent,
        FormFieldLabelDirective,
        FormFieldErrorComponent,
        FormFieldDescriptionDirective,
    ],
})
export class FormFieldModule {
}
