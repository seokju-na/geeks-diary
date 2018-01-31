import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from './button/button.component';
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
        IconComponent
    ],
    exports: [
        CommonModule,
        ReactiveFormsModule,
        // Button
        ButtonComponent,
        // Icon
        IconComponent
    ]
})
export class SharedModule {
}
