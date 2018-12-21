import * as packageInfo from '../../package.json';
import { isRendererProcess } from '../libs/process';


let app: Electron.App;


class Environment {
    readonly version = (packageInfo as any).version;
    readonly production = process.env.NODE_ENV === 'production';

    constructor() {
        if (isRendererProcess()) {
            app = require('electron').remote.app;
        } else {
            app = require('electron').app;
        }
    }

    getSentryDsn(): string {
        if (this.production) {
            return 'https://c00ff5f1eec343c3ad298dc3b6e47366@sentry.io/1353720';
        } else {
            return 'https://e18cb98edaa7446da779d10568c4d1bb@sentry.io/1353723';
        }
    }

    getAppPath(): string {
        return app.getAppPath();
    }

    getPath(name: string): string {
        return app.getPath(name);
    }
}


export const environment = new Environment();
