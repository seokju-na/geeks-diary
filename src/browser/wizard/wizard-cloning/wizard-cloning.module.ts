import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared';
import { UiModule } from '../../ui/ui.module';
import { VcsModule } from '../../vcs/vcs.module';
import { WizardCloningComponent } from './wizard-cloning.component';


@NgModule({
    imports: [
        UiModule,
        SharedModule,
        VcsModule,
        RouterModule,
    ],
    declarations: [
        WizardCloningComponent,
    ],
    exports: [
        WizardCloningComponent,
    ],
})
export class WizardCloningModule {
}
