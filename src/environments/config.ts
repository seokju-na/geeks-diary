export enum EnvironmentRunTarget {
    PRODUCTION = 'PRODUCTION',
    DEVELOPMENT = 'DEVELOPMENT',
}


export abstract class EnvironmentConfig {
    abstract RUN_TARGET: EnvironmentRunTarget;
    abstract production: boolean;
    abstract enableAot: boolean;
}
