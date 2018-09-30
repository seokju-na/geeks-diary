import * as path from 'path';
import fileUrl = require('file-url');


const pathIsInside =
    require('path-is-inside') as (source: string, dist: string) => boolean;


export function encodePathAsUrl(...pathSegments: string[]): string {
    const resolvedPath = path.resolve(...pathSegments);
    return fileUrl(resolvedPath);
}


/**
 * @example
 * isOutsidePath('/x/y/z', '/x/y'); // false
 * isOutsidePath('/x/y/z', '/x/y/z/v'); // true
 *
 * @param {string} source
 * @param {string} dist
 */
export function isOutsidePath(source: string, dist: string): boolean {
    return !pathIsInside(source, dist);
}
