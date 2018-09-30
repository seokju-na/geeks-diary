/**
 * Random integer between 'min' to 'max'.
 * The maximum is exclusive and the minimum is inclusive.
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randomInteger(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min)) + min;
}


/**
 * Random index of collection.
 * @param collection
 */
export function randomIndex<T = any>(collection: T[]): number {
    return randomInteger(0, collection.length);
}


/**
 * Get a random element from 'collection'.
 * @param {T[]} collection
 * @returns {T}
 */
export function sample<T>(collection: T[] | object): T {
    let result;

    if (Array.isArray(collection)) {
        result = collection[randomIndex(collection)];
    } else if (typeof collection === 'object') {
        const keys = Object.keys(collection);

        result = collection[keys[randomIndex(keys)]];
    }

    return result;
}


/**
 * Get a random element from 'collection' without 'excluded'.
 *
 * @example
 * enum Example {
 *     A = 10,
 *     B = 20,
 * }
 *
 * sampleWithout<Example>(Example, [Example.B]); // output: Example.A
 *
 * @param {T[] | object} collection
 * @param {any[]} excluded
 * @returns {T}
 */
export function sampleWithout<T>(
    collection: T[] | object,
    excluded: any[],
): T {

    let result;

    do {
        result = sample(collection);
    } while (excluded.includes(result));

    return result;
}
