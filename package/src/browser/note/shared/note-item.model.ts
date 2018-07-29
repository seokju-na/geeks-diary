export interface NoteItem {
    /** Unique note id. Format follows UUID. */
    readonly id: string;
    readonly title: string;
    readonly stackIds: string[];

    readonly contentFileName: string;
    readonly contentFilePath: string;

    readonly createdDatetime: number;
    readonly updatedDatetime: number;

    readonly label?: string;

    /**
     * Note file name.
     * e.g. {some-unique-id}.json
     */
    readonly fileName: string;

    /**
     * Note file path.
     * e.g. /foo/bar/workspace/.geeks-diary/notes/{some-unique-id}.json
     */
    readonly filePath: string;
}
