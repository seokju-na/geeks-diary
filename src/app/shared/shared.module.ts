import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutocompleteTriggerDirective } from './autocomplete/autocomplete-trigger.directive';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';
import { AutosizeDirective } from './autosize/autosize.directive';
import { ButtonComponent } from './button/button.component';
import { CalendarTableProvider } from './calendar/calendar-table';
import { Dialog } from './dialog/dialog';
import { DialogContainerComponent } from './dialog/dialog-container.component';
import { FormFieldControlDirective } from './form-field/form-field-control.directive';
import { FormFieldErrorComponent } from './form-field/form-field-error.component';
import { FormFieldHintComponent } from './form-field/form-field-hint.component';
import { FormFieldComponent } from './form-field/form-field.component';
import { IconComponent } from './icon/icon.component';
import { Menu } from './menu/menu';
import { OptionItemComponent } from './option-item/option-item.component';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { TextComponent } from './text/text.component';
import { TooltipComponent } from './tooltip/tooltip.component';
import { TooltipDirective } from './tooltip/tooltip.directive';
import { SpinnerContentComponent } from './spinner-content/spinner-content.component';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        OverlayModule,
        PortalModule,
        A11yModule,
    ],
    declarations: [
        // Autocomplete
        AutocompleteTriggerDirective,
        AutocompleteComponent,
        // Autosize
        AutosizeDirective,
        // Button
        ButtonComponent,
        // Icon
        IconComponent,
        // Dialog
        DialogContainerComponent,
        // Form field
        FormFieldComponent,
        FormFieldControlDirective,
        FormFieldErrorComponent,
        FormFieldHintComponent,
        // Option item
        OptionItemComponent,
        // Progress bar
        ProgressBarComponent,
        // Spinner
        SpinnerComponent,
        SpinnerContentComponent,
        // Text
        TextComponent,
        // Tooltip
        TooltipComponent,
        TooltipDirective,
    ],
    entryComponents: [
        // Dialog
        DialogContainerComponent,
        // Tooltip
        TooltipComponent,
    ],
    providers: [
        CalendarTableProvider,
        Dialog,
        Menu,
    ],
    exports: [
        CommonModule,
        ReactiveFormsModule,
        A11yModule,
        // Autocomplete
        AutocompleteTriggerDirective,
        AutocompleteComponent,
        // Autosize
        AutosizeDirective,
        // Button
        ButtonComponent,
        // Icon
        IconComponent,
        // Dialog
        DialogContainerComponent,
        // Form field
        FormFieldComponent,
        FormFieldControlDirective,
        FormFieldErrorComponent,
        FormFieldHintComponent,
        // Option item
        OptionItemComponent,
        // Progress bar
        ProgressBarComponent,
        // Spinner
        SpinnerComponent,
        SpinnerContentComponent,
        // Text
        TextComponent,
        // Tooltip
        TooltipDirective,
    ],
})
export class SharedModule {
}
