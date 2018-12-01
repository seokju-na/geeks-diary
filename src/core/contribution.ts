export interface Contribution {
    readonly items: { [key: string]: number };
}


export abstract class ContributionMeasurement<K> {
    abstract measure(keys: K[], keyGenerator: (key: K) => string): Contribution | Promise<Contribution>;
}
