import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TitleBarComponent } from './title-bar.component';


@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [
        TitleBarComponent,
    ],
    exports: [
        TitleBarComponent,
    ],
})
export class TitleBarModule {
}
