import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '../shared';
import { UiModule } from '../ui/ui.module';
import { VcsModule } from '../vcs/vcs.module';
import { WizardChoosingModule } from './wizard-choosing';
import { WizardCloningModule } from './wizard-cloning';
import { WizardRoutingModule } from './wizard-routing.module';
import { WizardComponent } from './wizard.component';


@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        UiModule,
        SharedModule,
        VcsModule,
        WizardChoosingModule,
        WizardCloningModule,
        WizardRoutingModule,
    ],
    declarations: [WizardComponent],
    bootstrap: [WizardComponent],
})
export class WizardModule {
}
