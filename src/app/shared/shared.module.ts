import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AutocompleteTriggerDirective } from './autocomplete/autocomplete-trigger.directive';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';
import { ButtonComponent } from './button/button.component';
import { FormFieldControlDirective } from './form-field/form-field-control.directive';
import { FormFieldErrorComponent } from './form-field/form-field-error.component';
import { FormFieldHintComponent } from './form-field/form-field-hint.component';
import { FormFieldComponent } from './form-field/form-field.component';
import { IconComponent } from './icon/icon.component';
import { OptionItemComponent } from './option-item/option-item.component';
import { TextComponent } from './text/text.component';


@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        OverlayModule
    ],
    declarations: [
        // Autocomplete
        AutocompleteTriggerDirective,
        AutocompleteComponent,
        // Button
        ButtonComponent,
        // Icon
        IconComponent,
        // Form field
        FormFieldComponent,
        FormFieldControlDirective,
        FormFieldErrorComponent,
        FormFieldHintComponent,
        // Option item
        OptionItemComponent,
        // Text
        TextComponent
    ],
    exports: [
        CommonModule,
        ReactiveFormsModule,
        // Autocomplete
        AutocompleteTriggerDirective,
        AutocompleteComponent,
        // Button
        ButtonComponent,
        // Icon
        IconComponent,
        // Form field
        FormFieldComponent,
        FormFieldControlDirective,
        FormFieldErrorComponent,
        FormFieldHintComponent,
        // Option item
        OptionItemComponent,
        // Text
        TextComponent
    ]
})
export class SharedModule {
}
