import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonComponent } from './button/button.component';


@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        ButtonComponent
    ],
    exports: [
        CommonModule,
        ButtonComponent
    ]
})
export class SharedModule {
}
