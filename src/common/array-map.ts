interface ArrayMapItem<T> {
    key: string;
    value: T;
}


export class ArrayMap<T> {
    private items: ArrayMapItem<T>[] = [];

    get size(): number {
        return this.items.length;
    }

    get values(): T[] {
        return this.items.map(i => i.value);
    }

    indexOfKey(key: string): number {
        return this.items.findIndex(i => i.key === key);
    }

    hasKey(key: string): boolean {
        const index = this.indexOfKey(key);

        return index !== -1;
    }

    hasKeyAt(index: number): boolean {
        return !!this.items[index];
    }

    get(key: string): T {
        if (this.hasKey(key)) {
            const index = this.indexOfKey(key);
            return this.items[index].value;
        }

        return null;
    }

    getAt(index: number): T {
        if (this.hasKeyAt(index)) {
            return this.items[index].value;
        }

        return null;
    }

    put(key: string, value: T): void {
        this.items.push({ key, value });
    }

    insert(key: string, value: T): void {
        this.items.push({ key, value });
    }

    insertBefore(key: string, value: T, refKey: string): void {
        const refIndex = this.indexOfKey(refKey);

        if (!this.hasKey(refKey)) {
            return;
        }

        if (refIndex === 0) {
            this.items.splice(0, 0, { key, value });
        } else {
            this.items.splice(refIndex - 1, 0, { key, value });
        }
    }

    insertAfter(key: string, value: T, refKey: string): void {
        const refIndex = this.indexOfKey(refKey);

        if (!this.hasKey(refKey)) {
            return;
        }

        if (refIndex === this.size - 1) {
            this.put(key, value);
        } else {
            this.items.splice(refIndex, 0, { key, value });
        }
    }

    remove(key: string): void {
        if (this.hasKey(key)) {
            const index = this.indexOfKey(key);
            this.items.splice(index, 1);
        }
    }

    removeAt(index: number): void {
        if (this.hasKeyAt(index)) {
            this.items.splice(index, 1);
        }
    }

    forEach(iterator: (item: T) => void): void {
        this.items.forEach(item => iterator(item.value));
    }
}
