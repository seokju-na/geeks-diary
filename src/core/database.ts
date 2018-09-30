import Dexie from 'dexie';


export abstract class Database extends Dexie {
    protected schemaVersion: number | undefined;

    protected constructor(name: string, schemaVersion?: number | undefined) {
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
