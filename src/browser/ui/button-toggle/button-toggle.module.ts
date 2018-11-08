import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonToggleComponent, ButtonToggleGroupDirective } from './button-toggle';


@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [
        ButtonToggleGroupDirective,
        ButtonToggleComponent,
    ],
    exports: [
        ButtonToggleGroupDirective,
        ButtonToggleComponent,
    ],
})
export class ButtonToggleModule {
}
