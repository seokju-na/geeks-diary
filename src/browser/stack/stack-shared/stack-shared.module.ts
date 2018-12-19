import { NgModule } from '@angular/core';
import { UiModule } from '../../ui/ui.module';
import { StackItemComponent } from './stack-item.component';


@NgModule({
    imports: [
        UiModule,
    ],
    declarations: [
        StackItemComponent,
    ],
    exports: [
        StackItemComponent,
    ],
})
export class StackSharedModule {
}

