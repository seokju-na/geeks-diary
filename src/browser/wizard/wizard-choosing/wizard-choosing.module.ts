import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared';
import { UiModule } from '../../ui/ui.module';
import { WizardChoosingComponent } from './wizard-choosing.component';


@NgModule({
    imports: [
        UiModule,
        SharedModule,
        RouterModule,
    ],
    declarations: [WizardChoosingComponent],
    exports: [WizardChoosingComponent],
})
export class WizardChoosingModule {
}
