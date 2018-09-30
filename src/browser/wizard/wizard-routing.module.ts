import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VcsRemoteAuthenticationInfoResolver } from '../vcs/vcs-remote';
import { WizardChoosingComponent } from './wizard-choosing';
import { WizardCloningComponent } from './wizard-cloning';


const WIZARD_ROUTES: Routes = [
    {
        path: '',
        component: WizardChoosingComponent,
    },
    {
        path: 'cloning',
        component: WizardCloningComponent,
        resolve: {
            isAuthenticationInfoExists: VcsRemoteAuthenticationInfoResolver,
        },
    },
];


@NgModule({
    imports: [RouterModule.forRoot(WIZARD_ROUTES, { useHash: true })],
    exports: [RouterModule],
})
export class WizardRoutingModule {
}
