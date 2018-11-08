export interface Factory<T> {
    create(type: any, ...extras: any[]): T;
}


export abstract class Builder<T> {
    abstract build(): T;
}


export abstract class Strategy {
    abstract execute(...extras: any[]): any;
}


export type PropGetter<T, P = any> = (value: T) => P;
