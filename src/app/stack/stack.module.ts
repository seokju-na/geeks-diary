import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { StackChipComponent } from './chip/chip.component';
import { StackViewer } from './stack-viewer';


@NgModule({
    imports: [
        SharedModule,
    ],
    declarations: [
        StackChipComponent,
    ],
    providers: [
        StackViewer,
    ],
    exports: [
        StackChipComponent,
    ],
})
export class StackModule {
}
