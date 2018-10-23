import { NgModule } from '@angular/core';
import { StackChipModule } from './stack-ship';
import { StackViewer } from './stack-viewer';


@NgModule({
    imports: [
        StackChipModule,
    ],
    providers: [
        StackViewer,
    ],
    exports: [
        StackChipModule,
    ],
})
export class StackModule {
}
