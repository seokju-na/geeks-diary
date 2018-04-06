import { EnvironmentConfig, EnvironmentRunTarget } from './config';


export class EnvironmentProductionConfig extends EnvironmentConfig {
    RUN_TARGET = EnvironmentRunTarget.PRODUCTION;
    production = true;
    enableAot = true;
    basePath = '/';
}
