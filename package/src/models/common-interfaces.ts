export interface Factory<T, P> {
    create(type: P, ...extras: any[]): T;
}


export abstract class Builder<T> {
    abstract build(): T;
}


export abstract class Strategy {
    abstract execute(...extras: any[]): void;
}


export type PropGetter<T, P = any> = (value: T) => P;
