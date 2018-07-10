export enum NoteSnippetType {
    TEXT = 'TEXT',
    CODE = 'CODE',
}


export interface NoteSnippet {
    /** Unique note snippet id. Format follows UUID. */
    readonly id: string;
    readonly type: NoteSnippetType;

    /** Line number where snippet starts. */
    readonly startLineNumber: number;

    /** Line number where snippet ends. */
    readonly endLineNumber: number;

    /** Language id which code snippet contains. */
    readonly codeLanguageId?: string;

    /** File name which code snippet contains. */
    readonly codeFileName?: string;
}
