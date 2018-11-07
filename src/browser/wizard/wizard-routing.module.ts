import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WizardVcsAuthenticationInfoExistsResolver } from './resolvers';
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
            isAuthenticationInfoExists: WizardVcsAuthenticationInfoExistsResolver,
        },
    },
];


@NgModule({
    imports: [RouterModule.forRoot(WIZARD_ROUTES, { useHash: true })],
    exports: [RouterModule],
})
export class WizardRoutingModule {
}
