export enum EnvironmentRunTarget {
    PRODUCTION = 'PRODUCTION',
    DEVELOPMENT = 'DEVELOPMENT'
}


export abstract class EnvironmentConfig {
    RUN_TARGET: EnvironmentRunTarget;
    production: boolean;
    enableAot: boolean;
}
