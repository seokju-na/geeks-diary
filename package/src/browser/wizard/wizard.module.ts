import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from '../core/core.module';
import { UIModule } from '../ui/ui.module';
import { WizardComponent } from './wizard.component';
import { WizardStepComponent } from './wizard-step/wizard-step.component';


@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CoreModule,
        UIModule,
    ],
    declarations: [
        WizardComponent,
        WizardStepComponent,
    ],
    bootstrap: [WizardComponent],
})
export class WizardModule {
}
