import { EnvironmentConfig, EnvironmentRunTarget } from './config';


export class EnvironmentProductionConfig extends EnvironmentConfig {
    RUN_TARGET = EnvironmentRunTarget.PRODUCTION;
    priduction = true;
    enableAot = true;
}
