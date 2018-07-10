import Dexie from 'dexie';


export abstract class Database extends Dexie {
    protected schemaVersion: number | undefined;

    constructor(name: string, schemaVersion?: number | undefined) {
        super(name);

        this.schemaVersion = schemaVersion;
    }

    protected async conditionalVersion(
        version: number,
        schema: { [key: string]: string | null },
        upgrade?: (t: Dexie.Transaction) => Promise<void>,
    ): Promise<void> {

        if (this.schemaVersion !== null && this.schemaVersion < version) {
            return;
        }

        const dexieVersion = this.version(version).stores(schema);

        if (upgrade) {
            await dexieVersion.upgrade(upgrade);
        }
    }
}


export interface Example {
    readonly id?: number;
    readonly theme: string;
}


export class ExampleDatabase extends Database {
    examples!: Dexie.Table<Example, number>;

    constructor() {
        super('ExampleDatabase');

        this.conditionalVersion(1, {
            examples: '++id, theme',
        });
    }
}
