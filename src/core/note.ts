export interface Note {
    /** Unique note id. Format follows UUID. */
    readonly id: string;
    readonly title: string;
    readonly snippets: NoteSnippet[];
    readonly stackIds: string[];

    /** Content file name. e.g. 18-07-21-Note-Title-1.md */
    readonly contentFileName: string;

    /** Content file path. e.g. /foo/bar/workspace/CATEGORY/18-07-21-Note-Title-1.md */
    readonly contentFilePath: string;

    readonly createdDatetime: number;
    readonly updatedDatetime: number;
}


export enum NoteSnippetTypes {
    TEXT = 'TEXT',
    CODE = 'CODE',
}


export interface NoteSnippet {
    readonly type: NoteSnippetTypes;

    /** Line number where snippet starts. */
    readonly startLineNumber: number;

    /** Line number where snippet ends. */
    readonly endLineNumber: number;

    /** Language id which code snippet contains. */
    readonly codeLanguageId?: string;

    /** File name which code snippet contains. */
    readonly codeFileName?: string;
}
