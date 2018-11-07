export enum VcsAuthenticationTypes {
    BASIC = 'BASIC',
    OAUTH2_TOKEN = 'OAUTH2_TOKEN',
}


export interface VcsAuthenticationInfo {
    readonly type: VcsAuthenticationTypes;
    readonly authorizationHeader: string;
    readonly providerName: string;

    /** BASIC */
    readonly username?: string;
    readonly password?: string;

    /** OAUTH2_TOKEN */
    readonly token?: string;
}


export interface VcsRemoteRepository {
    readonly url: string;
    readonly apiUrl?: string;
    readonly name: string;
    readonly gitUrl?: string;
    readonly sshUrl?: string;
}


export enum VcsFileChangeStatusTypes {
    NEW = 'NEW',
    MODIFIED = 'MODIFIED',
    RENAMED = 'RENAMED',
    REMOVED = 'REMOVED',
    CONFLICTED = 'CONFLICTED',
    IGNORED = 'IGNORED',
}


export interface VcsFileChange {
    /** File path relative with working directory. */
    readonly filePath: string;

    /** Working directory path. */
    readonly workingDirectoryPath: string;

    /** Absolute file path. */
    readonly absoluteFilePath: string;

    /** Vcs status of file. */
    readonly status: VcsFileChangeStatusTypes;

    /** Diff for Head to index. */
    readonly headToIndexDiff?: {
        readonly oldFilePath: string;
        readonly newFilePath: string;
    };
}


export enum VcsErrorCodes {
    AUTHENTICATE_ERROR = 'AUTHENTICATE_ERROR',
    REPOSITORY_NOT_EXISTS = 'REPOSITORY_NOT_EXISTS',
    UNKNOWN = 'UNKNOWN',
}


export class VcsError extends Error {
    constructor(public readonly code: VcsErrorCodes) {
        super(getDescriptionForError(code));
    }
}


function getDescriptionForError(code: VcsErrorCodes): string {
    switch (code) {
        case VcsErrorCodes.AUTHENTICATE_ERROR:
            return 'Authenticate failed.';
        case VcsErrorCodes.REPOSITORY_NOT_EXISTS:
            return 'Cannot find repository.';
        case VcsErrorCodes.UNKNOWN:
            return 'Unknown error.';
    }
}
