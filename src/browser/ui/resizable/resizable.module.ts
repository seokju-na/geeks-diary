import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ResizableContentComponent } from './resizable-content.component';
import { ResizableHandlerDirective } from './resizable-handler.directive';


@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [
        ResizableContentComponent,
        ResizableHandlerDirective,
    ],
    exports: [
        ResizableContentComponent,
        ResizableHandlerDirective,
    ],
})
export class ResizableModule {
}
