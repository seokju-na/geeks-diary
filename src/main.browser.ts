import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { webFrame } from 'electron';
import { AppModule } from './app/app.module';
import { afterLoadMonaco } from './app/utils/after-load-monaco';
import './app/utils/disable-eval';
import { environment } from './environments/environment';
import './styles/styles.less';


webFrame.setVisualZoomLevelLimits(1, 1);


if (environment.config.production) {
    enableProdMode();
}

afterLoadMonaco()
    .then(() =>
        platformBrowserDynamic().bootstrapModule(AppModule),
    )
    .catch((err) => {
        console.error(err);
    });
