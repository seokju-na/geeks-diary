import { EnvironmentConfig, EnvironmentRunTarget } from './config';


export class EnvironmentTestConfig extends EnvironmentConfig {
    RUN_TARGET = EnvironmentRunTarget.TEST;
    production = false;
    enableAot = false;
}
