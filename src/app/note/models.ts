export class NoteMetadata {
    readonly id: string;
    readonly title: string;
    readonly stacks: string[];
    readonly createdDatetime: number;
    readonly updatedDatetime: number | null;
    fileName?: string;
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


export enum NoteFinderDateFilterTypes {
    MONTH = 'MONTH',
    DATE = 'DATE',
}


export enum NoteFinderSortTypes {
    TITLE = 'TITLE',
    CREATED = 'CREATED',
    UPDATED = 'UPDATED',
}


export enum NoteFinderSortDirection {
    ASC = 'ASC',
    DESC = 'DESC',
}
