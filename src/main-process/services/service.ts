import { EventEmitter } from 'events';


export abstract class Service extends EventEmitter {
    protected constructor(public readonly name: string) {
        super();
    }

    abstract init(...di: Service[]): void | Promise<void>;
    abstract handleError<E = any, T = any>(error: E): T;
}
