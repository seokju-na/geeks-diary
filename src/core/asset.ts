export enum AssetTypes {
    IMAGE = 'IMAGE',
}


export class Asset {
    readonly type: AssetTypes;

    /** Name of asset file (include extension). e.g. some-image.png */
    readonly fileName: string;

    /** Name of asset file without extension. */
    readonly fileNameWithoutExtension: string;

    /** File path of asset file. e.g. /foo/bar/workspace/.geeks-diary/assets/some-image.png */
    readonly filePath: string;

    /** Extension of asset file. e.g. some-image.png -> '.png' */
    readonly extension: string;

    /** Relative path to workspace folder. */
    readonly relativePathToWorkspaceDir: string;
}
