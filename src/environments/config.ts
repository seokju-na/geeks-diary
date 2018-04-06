export enum EnvironmentRunTarget {
    PRODUCTION = 'PRODUCTION',
    DEVELOPMENT = 'DEVELOPMENT',
    TEST = 'TEST',
}


export abstract class EnvironmentConfig {
    abstract RUN_TARGET: EnvironmentRunTarget;
    abstract production: boolean;
    abstract enableAot: boolean;
    abstract basePath: string;
}
