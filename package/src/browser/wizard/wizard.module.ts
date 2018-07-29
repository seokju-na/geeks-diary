import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from '../core/core.module';
import { UIModule } from '../ui/ui.module';
import { VcsModule } from '../vcs/vcs.module';
import { WizardComponent } from './wizard.component';
import { WizardCloningComponent } from './wizard-cloning/wizard-cloning.component';


@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CoreModule,
        UIModule,
        VcsModule,
    ],
    declarations: [
        WizardComponent,
        WizardCloningComponent,
    ],
    bootstrap: [WizardComponent],
})
export class WizardModule {
}
