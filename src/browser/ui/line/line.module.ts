import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LineDirective } from './line.directive';


@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [LineDirective],
    exports: [LineDirective],
})
export class LineModule {
}
