export class NoteSimple {
    readonly id: string;
    readonly title: string;
    readonly stacks: string[];
    readonly createdDatetime: number;
    readonly updatedDatetime: number | null;
}


export enum NoteContentSnippetTypes {
    CODE = 'code',
    TEXT = 'text',
}


export class NoteContentSnippet {
    readonly id: string;
    readonly type: NoteContentSnippetTypes;
    readonly value: string;
    readonly language?: string;
    readonly fileName?: string;
}


export class NoteContent {
    readonly noteId: string;
    readonly snippets: NoteContentSnippet[];
}
