import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RadioButtonComponent, RadioGroupDirective } from './radio';


@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [
        RadioGroupDirective,
        RadioButtonComponent,
    ],
    exports: [
        RadioGroupDirective,
        RadioButtonComponent,
    ],
})
export class RadioModule {
}
