import * as path from 'path';


export enum AssetTypes {
    IMAGE = 'IMAGE',
}


export class Asset {
    readonly type: AssetTypes;

    /** Name of asset file. e.g. some-image.png */
    readonly fileName: string;

    /** File path of asset file. e.g. /foo/bar/workspace/.geeks-diary/assets/some-image.png */
    readonly filePath: string;

    /** Extension of asset file. e.g. some-image.png -> '.png' */
    readonly extension: string;
}


export function getFilePathDescription(filePath: string): {
    fileName: string;
    dirName: string;
    extension: string;
} {
    return {
        fileName: path.basename(filePath),
        dirName: path.dirname(filePath),
        extension: path.extname(filePath),
    };
}
