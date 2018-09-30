import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from '../core/environment';
import { workspaceDatabase } from './shared';
import { WizardModule } from './wizard/wizard.module';


if (environment.production) {
    enableProdMode();
}

Promise.all([workspaceDatabase.init()])
    .then(() => platformBrowserDynamic().bootstrapModule(WizardModule))
    .catch(error => console.error(error));
