import { Observable, Subject } from 'rxjs';


let uniqueId = 0;


export interface Tab<T = any> {
    id?: string;
    name: string;
    value: T;
}


export class TabControl<T = any> {
    readonly tabs: Tab<T>[] = [];

    private currentActiveTabIndex: number | null = null;
    private _activateTabChanges = new Subject<Tab>();

    constructor(tabs: Tab<T>[]) {
        if (tabs.length === 0) {
            throw new Error('Tabs must be provided at least 1.');
        }

        this.tabs = tabs.map(tab => ({
            id: tab.id ? tab.id : `gd-tab-${uniqueId++}`,
            name: tab.name,
            value: tab.value,
        }));

        this.selectTabByIndex(0);
    }

    get activateTabChanges(): Observable<Tab> {
        return this._activateTabChanges.asObservable();
    }

    get activateTab(): Tab | null {
        if (this.currentActiveTabIndex !== null) {
            return this.tabs[this.currentActiveTabIndex];
        } else {
            return null;
        }
    }

    get activeTabIndex(): number | null {
        return this.currentActiveTabIndex;
    }

    selectFirstTab(): void {
        this.selectTabByIndex(0);
    }

    selectLastTab(): void {
        this.selectTabByIndex(this.tabs.length - 1);
    }

    selectTabByIndex(index: number): void {
        if (this.tabs[index]) {
            this.currentActiveTabIndex = index;
            this._activateTabChanges.next(this.activateTab);
        }
    }

    selectTabByValue(value: T): void {
        const index = this.tabs.findIndex(tab => tab.value === value);

        if (index !== -1) {
            this.currentActiveTabIndex = index;
            this._activateTabChanges.next(this.activateTab);
        }
    }

    deselect(): void {
        this.currentActiveTabIndex = null;
        this._activateTabChanges.next(this.activateTab);
    }
}
