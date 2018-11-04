import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule, GridModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { AutocompleteModule } from './autocomplete';
import { ButtonModule } from './button';
import { ButtonToggleModule } from './button-toggle';
import { CheckboxModule } from './checkbox';
import { DialogModule } from './dialog';
import { FormFieldModule } from './form-field';
import { IconModule } from './icon';
import { InputModule } from './input';
import { LineModule } from './line';
import { MenuModule } from './menu';
import { RadioModule } from './radio';
import { ResizableModule } from './resizable';
import { SpinnerModule } from './spinner';
import { StyleModule } from './style';
import { TabsModule } from './tabs';
import { TextFieldModule } from './text-field';
import { TitleBarModule } from './title-bar';
import { TooltipModule } from './tooltip';


const ANGULAR_MODULES = [
    CommonModule,
    ReactiveFormsModule,
];

const CDK_MODULES = [
    A11yModule,
    FlexLayoutModule,
    GridModule,
];

const UI_MODULES = [
    AutocompleteModule,
    DialogModule,
    FormFieldModule,
    InputModule,
    ButtonModule,
    IconModule,
    TitleBarModule,
    ResizableModule,
    SpinnerModule,
    TooltipModule,
    RadioModule,
    StyleModule,
    ButtonToggleModule,
    LineModule,
    TextFieldModule,
    MenuModule,
    TabsModule,
    CheckboxModule,
];


@NgModule({
    imports: [
        ...ANGULAR_MODULES,
        ...CDK_MODULES,
        ...UI_MODULES,
    ],
    exports: [
        ...ANGULAR_MODULES,
        ...CDK_MODULES,
        ...UI_MODULES,
    ],
})
export class UiModule {
}
