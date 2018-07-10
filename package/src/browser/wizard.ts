import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from '../environments/environment';
import { WizardModule } from './wizard/wizard.module';


if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic()
    .bootstrapModule(WizardModule)
    .catch(error => console.error(error));
