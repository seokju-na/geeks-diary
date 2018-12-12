export enum NoteErrorCodes {
    CONTENT_FILE_ALREADY_EXISTS = 'CONTENT_FILE_EXISTS',
    OUTSIDE_WORKSPACE = 'OUTSIDE_WORKSPACE',
}


export class NoteContentFileAlreadyExistsError extends Error {
    readonly code = NoteErrorCodes.CONTENT_FILE_ALREADY_EXISTS;

    constructor() {
        super('Note with same file name already exists.');
    }
}


export class NoteOutsideWorkspaceError extends Error {
    readonly code = NoteErrorCodes.OUTSIDE_WORKSPACE;

    constructor() {
        super('Cannot create note outside workspace.');
    }
}


export type NoteError =
    NoteContentFileAlreadyExistsError
    | NoteOutsideWorkspaceError;
