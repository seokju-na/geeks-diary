import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from './button/button.component';
import { FormFieldControlDirective } from './form-field/form-field-control.directive';
import { FormFieldErrorComponent } from './form-field/form-field-error.component';
import { FormFieldHintComponent } from './form-field/form-field-hint.component';
import { FormFieldComponent } from './form-field/form-field.component';
import { IconComponent } from './icon/icon.component';


@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule
    ],
    declarations: [
        // Button
        ButtonComponent,
        // Icon
        IconComponent,
        // Form field
        FormFieldComponent,
        FormFieldControlDirective,
        FormFieldErrorComponent,
        FormFieldHintComponent
    ],
    exports: [
        CommonModule,
        ReactiveFormsModule,
        // Button
        ButtonComponent,
        // Icon
        IconComponent,
        // Form field
        FormFieldComponent,
        FormFieldControlDirective,
        FormFieldErrorComponent,
        FormFieldHintComponent
    ]
})
export class SharedModule {
}
