import { A11yModule } from '@angular/cdk/a11y';
import { ObserversModule } from '@angular/cdk/observers';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CheckboxComponent } from './checkbox.component';


@NgModule({
    imports: [
        A11yModule,
        ObserversModule,
        CommonModule,
    ],
    declarations: [
        CheckboxComponent,
    ],
    exports: [
        CheckboxComponent,
    ],
})
export class CheckboxModule {
}
