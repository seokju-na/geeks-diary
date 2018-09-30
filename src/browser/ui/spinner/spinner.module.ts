import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SpinnerComponent } from './spinner.component';


@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [SpinnerComponent],
    exports: [SpinnerComponent],
})
export class SpinnerModule {
}
