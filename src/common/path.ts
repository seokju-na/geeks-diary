import * as path from 'path';
import fileUrl = require('file-url');


export function encodePathAsUrl(...pathSegments: string[]): string {
    const resolvedPath = path.resolve(...pathSegments);
    return fileUrl(resolvedPath);
}
