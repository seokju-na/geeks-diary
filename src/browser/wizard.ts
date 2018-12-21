import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from '../core/environment';
import { logMonitor } from '../core/log-monitor';
import { workspaceDatabase } from './shared';
import { WizardModule } from './wizard/wizard.module';


if (environment.production) {
    enableProdMode();
}

Promise.all([
    workspaceDatabase.init(),
    logMonitor.install('browser/wizard'),
]).then(() =>
    platformBrowserDynamic().bootstrapModule(WizardModule),
).catch(error => console.error(error));
