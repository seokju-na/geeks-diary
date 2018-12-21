import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EffectsModule } from '@ngrx/effects';
import { combineReducers, StoreModule } from '@ngrx/store';
import { SharedModule } from '../shared';
import { UiModule } from '../ui/ui.module';
import { VcsModule } from '../vcs';
import { WizardVcsAuthenticationInfoExistsResolver } from './resolvers';
import { WizardChoosingModule } from './wizard-choosing';
import { WizardCloningModule } from './wizard-cloning';
import { WizardRoutingModule } from './wizard-routing.module';
import { WizardComponent } from './wizard.component';


@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        UiModule,
        StoreModule.forRoot(combineReducers({})),
        EffectsModule.forRoot([]),
        SharedModule,
        VcsModule,
        WizardChoosingModule,
        WizardCloningModule,
        WizardRoutingModule,
    ],
    declarations: [WizardComponent],
    providers: [
        WizardVcsAuthenticationInfoExistsResolver,
    ],
    bootstrap: [WizardComponent],
})
export class WizardModule {
}
