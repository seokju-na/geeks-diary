import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { StackChipComponent } from './chip/chip.component';
import { StackEditFormComponent } from './edit-form/edit-form.component';
import { StackViewer } from './stack-viewer';


@NgModule({
    imports: [
        SharedModule,
    ],
    declarations: [
        StackEditFormComponent,
        StackChipComponent,
    ],
    providers: [
        StackViewer,
    ],
    exports: [
        StackEditFormComponent,
        StackChipComponent,
    ],
})
export class StackModule {
}
