import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from './button/button.component';


@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule
    ],
    declarations: [
        ButtonComponent
    ],
    exports: [
        CommonModule,
        ReactiveFormsModule,

        ButtonComponent
    ]
})
export class SharedModule {
}
