export abstract class DummyFactory<T> {
    abstract create(): T;
}


export class IntegerIdDummyFactory implements DummyFactory<number> {
    private id = 0;

    create(): number {
        return this.id++;
    }
}


export class StringIdDummyFactory implements DummyFactory<string> {
    private id = 0;

    constructor(readonly namespace = 'id') {}

    create(): string {
        return `${this.namespace}-${this.id++}`;
    }
}


export class TextDummyFactory implements DummyFactory<string> {
    private count = 0;

    constructor(private readonly baseText = 'Text') {
    }

    create(): string {
        return `${this.baseText}-${this.count++}`;
    }
}


export class DatetimeDummyFactory implements DummyFactory<number> {
    constructor(private date?: Date) {
    }

    create(): number {
        if (this.date) {
            return this.date.getTime();
        }

        return new Date().getTime();
    }
}


export class TypesDummyFactory<T> implements DummyFactory<T> {
    constructor(readonly types: T[]) {
    }

    create(): T {
        const index = Math.floor(Math.random() * this.types.length);

        return this.types[index];
    }
}



export function createDummyList<T>(factory: DummyFactory<T>, count: number): T[] {
    const list: T[] = [];

    for (let i = 0; i < count; i++) {
        list.push(factory.create());
    }

    return list;
}
