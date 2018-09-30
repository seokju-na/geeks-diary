import { PropGetter, Strategy } from './common-interfaces';


export enum SortDirection {
    DESC = 'DESC',
    ASC = 'ASC',
}


/**
 * Sorting strategy manager.
 *
 * @example
 * const sorting = new Sorting<Item>();
 *
 * sorting
 *     .setIndexPropGetter(item => item.createdDatetime)
 *     .setDirection(SortDirection.DESC)
 *     .sort(items);
 */
export class Sorting<T> {
    private propGetter: PropGetter<T>;
    private strategy: Strategy = new SortDescStrategy<T>();

    /** Set index property of T which uses for sorting. */
    setIndexPropGetter(propGetter: PropGetter<T, number | string>): this {
        this.propGetter = propGetter;
        return this;
    }

    setDirection(direction: SortDirection): this {
        switch (direction) {
            case SortDirection.ASC:
                this.strategy = new SortAscStrategy<T>();
                break;

            case SortDirection.DESC:
                this.strategy = new SortDescStrategy<T>();
                break;
        }

        return this;
    }

    sort(items: T[]): void {
        this.strategy.execute(items, this.propGetter);
    }
}


const sortFn = (direction: 1 | -1) => (a: any, b: any): number => {
    if (a < b) {
        return -1 * direction;
    } else if (a > b) {
        return 1 * direction;
    }

    return 0;
};


function getIndexProps<T>(a: T, b: T, propGetter: PropGetter<T>): [any, any] {
    let aProp;
    let bProp;

    try {
        aProp = propGetter(a);
        bProp = propGetter(b);
    } catch (error) {
        console.error('Error during getting props.', error);
    }

    return [aProp, bProp];
}


export class SortDescStrategy<T> extends Strategy {
    execute(items: T[], propGetter: PropGetter<T>): void {
        items.sort((a: T, b: T): number => {
            const [aProp, bProp] = getIndexProps(a, b, propGetter);

            return sortFn(-1)(aProp, bProp);
        });
    }
}


export class SortAscStrategy<T> extends Strategy {
    execute(items: T[], propGetter: PropGetter<T>): void {
        items.sort((a: T, b: T): number => {
            const [aProp, bProp] = getIndexProps(a, b, propGetter);

            return sortFn(1)(aProp, bProp);
        });
    }
}
