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

    getAppPath(): string {
        return app.getAppPath();
    }

    getPath(name: string): string {
        return app.getPath(name);
    }
}


export const environment = new Environment();
