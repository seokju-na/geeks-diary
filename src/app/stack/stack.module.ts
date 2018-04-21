import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { StackChipComponent } from './chip/chip.component';


@NgModule({
    imports: [
        SharedModule,
    ],
    declarations: [
        StackChipComponent,
    ],
    providers: [],
    exports: [
        StackChipComponent,
    ],
})
export class StackModule {
}
