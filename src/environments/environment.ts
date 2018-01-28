import { EnvironmentConfig } from './config';
import { isRendererProcess } from '../common/is-renderer-process';
import { EnvironmentProductionConfig } from './config.prod';
import { EnvironmentDevelopmentConfig } from './config.dev';


let app;

class Environment {
    readonly config: EnvironmentConfig;

    constructor(config: EnvironmentConfig) {
        this.config = config;

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


export let environment: Environment;

switch (process.env.RUN_TARGET) {
    case 'production':
        environment = new Environment(new EnvironmentProductionConfig());
        break;
    case 'development':
    default:
        environment = new Environment(new EnvironmentDevelopmentConfig());
        break;
}
