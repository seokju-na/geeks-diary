import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from '../core/environment';
import { logMonitor } from '../core/log-monitor';
import { AppModule } from './app/app.module';
import { workspaceDatabase } from './shared';


if (environment.production) {
    enableProdMode();
}


Promise.all([
    workspaceDatabase.init(),
    logMonitor.install('browser/app'),
]).then(() =>
    platformBrowserDynamic().bootstrapModule(AppModule),
).catch(error => console.error(error));
