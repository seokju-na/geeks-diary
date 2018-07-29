export enum NoteErrorCodes {
    CONTENT_FILE_EXISTS = 'CONTENT_FILE_EXISTS',
    OUTSIDE_WORKSPACE = 'OUTSIDE_WORKSPACE',
}


export class NoteError extends Error {
    readonly errorDescription: string;

    constructor(public readonly code: NoteErrorCodes) {
        super(getErrorDescription(code));

        this.name = 'NoteError';
        this.errorDescription = getErrorDescription(code);
    }
}


function getErrorDescription(code: NoteErrorCodes): string {
    switch (code) {
        case NoteErrorCodes.CONTENT_FILE_EXISTS:
            return 'Note with same file name already exists';

        case NoteErrorCodes.OUTSIDE_WORKSPACE:
            return 'Cannot create note outside workspace';

        default:
            return 'Unknown Error';
    }
}
