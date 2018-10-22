import { NgModule } from '@angular/core';
import { UiModule } from '../../ui/ui.module';
import { StackChipComponent } from './stack-chip.component';


@NgModule({
    imports: [
        UiModule,
    ],
    declarations: [
        StackChipComponent,
    ],
    exports: [
        StackChipComponent,
    ],
})
export class StackChipModule {
}

