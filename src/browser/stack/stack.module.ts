import { NgModule } from '@angular/core';
import { StackSharedModule } from './stack-shared';
import { StackViewer } from './stack-viewer';


@NgModule({
    imports: [
        StackSharedModule,
    ],
    providers: [
        StackViewer,
    ],
    exports: [
        StackSharedModule,
    ],
})
export class StackModule {
}
