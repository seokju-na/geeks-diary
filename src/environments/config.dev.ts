import { EnvironmentConfig, EnvironmentRunTarget } from './config';


export class EnvironmentDevelopmentConfig extends EnvironmentConfig {
    RUN_TARGET = EnvironmentRunTarget.DEVELOPMENT;
    production = false;
    enableAot = false;
}
