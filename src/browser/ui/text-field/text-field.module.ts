import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AutosizeDirective } from './autosize.directive';


@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [AutosizeDirective],
    exports: [AutosizeDirective],
})
export class TextFieldModule {
}
