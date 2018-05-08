import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { afterLoadMonaco } from './app/utils/after-load-monaco';
import { environment } from './environments/environment';
import './styles/styles.less';


require('electron').webFrame.setZoomLevelLimits(1, 1);


if (environment.config.production) {
    enableProdMode();
}

afterLoadMonaco().subscribe(() => {
    platformBrowserDynamic()
        .bootstrapModule(AppModule)
        .catch((err) => {
            console.error(err);
        });
});
