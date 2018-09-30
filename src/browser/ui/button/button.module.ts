import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SpinnerModule } from '../spinner';
import { AnchorButtonComponent } from './anchor-button.component';
import { ButtonComponent } from './button.component';


@NgModule({
    imports: [
        CommonModule,
        SpinnerModule,
    ],
    declarations: [
        ButtonComponent,
        AnchorButtonComponent,
    ],
    exports: [
        ButtonComponent,
        AnchorButtonComponent,
    ],
})
export class ButtonModule {
}
