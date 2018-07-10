import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from '../environments/environment';
import { AppModule } from './app/app.module';
import { afterMonacoLoaded } from './utils/after-monaco-loaded';
import { afterWorkspaceInit } from './utils/after-workspace-init';


if (environment.production) {
    enableProdMode();
}


Promise
    .all([afterMonacoLoaded(), afterWorkspaceInit()])
    .then(() => platformBrowserDynamic().bootstrapModule(AppModule))
    .catch(error => console.error(error));
