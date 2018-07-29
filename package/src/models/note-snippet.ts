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
