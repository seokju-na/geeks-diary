import * as fs from 'fs';
import { of, Subject, Subscription } from 'rxjs';
import { catchError, debounceTime, retry, switchMap } from 'rxjs/operators';
import { promisify } from 'util';
import { writeFileAsObservable } from './fs';


export class StorageConstructOptions<T> {
    filePath: string;
    saveThrottle?: number = 500;
    retryCount?: number = 3;
    initialData: T;
}


const readFileAsync = promisify(fs.readFile);


export class Storage<T> {
    private data: T | null = null;
    private _loaded: boolean = false;

    private options: StorageConstructOptions<T>;

    private saves = new Subject<string>();
    private saveSubscription = Subscription.EMPTY;

    constructor(options: StorageConstructOptions<T>) {
        this.options = {
            ...(new StorageConstructOptions()),
            ...options,
        };

        this.saveSubscription = this.saves.asObservable()
            .pipe(
                debounceTime(this.options.saveThrottle),
                switchMap(value =>
                    writeFileAsObservable(this.options.filePath, value, 'utf8').pipe(
                        retry(this.options.retryCount),
                        catchError(error => of(null)),
                    ),
                ),
            )
            .subscribe();
    }

    get loaded(): boolean {
        return this._loaded;
    }

    async load(): Promise<void> {
        try {
            const result = await readFileAsync(this.options.filePath);

            this.data = JSON.parse(result.toString());
        } catch (error) {
            this.data = { ...(this.options.initialData as any) };
            this.save({});
        }

        this._loaded = true;
    }

    get<R>(name: string): R | undefined | null {
        if (!this._loaded) {
            return null;
        }

        return this.data[name];
    }

    save(data: Partial<T>): void {
        this.data = Object.assign({}, this.data, data);
        this.saves.next(JSON.stringify(this.data));
    }
}
