import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from '../core/environment';
import { AppModule } from './app/app.module';
import { workspaceDatabase } from './shared';


if (environment.production) {
    enableProdMode();
}


Promise.all([workspaceDatabase.init()])
    .then(() => platformBrowserDynamic().bootstrapModule(AppModule))
    .catch(error => console.error(error));
