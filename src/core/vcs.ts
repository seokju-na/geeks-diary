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


export function getVcsFileChangeStatusName(status: VcsFileChangeStatusTypes): string {
    switch (status) {
        case VcsFileChangeStatusTypes.NEW:
            return 'New';
        case VcsFileChangeStatusTypes.MODIFIED:
            return 'Modified';
        case VcsFileChangeStatusTypes.RENAMED:
            return 'Renamed';
        case VcsFileChangeStatusTypes.REMOVED:
            return 'Removed';
    }
}


export function getVcsFileChangeStatusIcon(status: VcsFileChangeStatusTypes): string {
    /* tslint:disable */
    switch (status) {
        case VcsFileChangeStatusTypes.NEW:
            // Green
            return `
            <svg width="256" height="256" viewBox="0 0 14 16" version="1.1" aria-hidden="true">
                <path fill-rule="evenodd" fill="#4caf50" d="M13 1H1c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1zm0 13H1V2h12v12zM6 9H3V7h3V4h2v3h3v2H8v3H6V9z"></path>
            </svg>
            `;

        case VcsFileChangeStatusTypes.MODIFIED:
            // Ember
            return `
            <svg width="256" height="256" viewBox="0 0 14 16" version="1.1" aria-hidden="true">
                <path fill-rule="evenodd" fill="#ffc107" d="M13 1H1c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1zm0 13H1V2h12v12zM4 8c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3z"></path>
            </svg>
            `;

        case VcsFileChangeStatusTypes.RENAMED:
            // Blue
            return `
            <svg width="256" height="256" viewBox="0 0 14 16" version="1.1" aria-hidden="true">
                <path fill-rule="evenodd" fill="#2196f3" d="M6 9H3V7h3V4l5 4-5 4V9zm8-7v12c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V2c0-.55.45-1 1-1h12c.55 0 1 .45 1 1zm-1 0H1v12h12V2z"></path>
            </svg>
            `;

        case VcsFileChangeStatusTypes.REMOVED:
            // Red
            return `
            <svg width="256" height="256" viewBox="0 0 14 16" version="1.1" aria-hidden="true">
                <path fill-rule="evenodd" fill="#e53935" d="M13 1H1c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1zm0 13H1V2h12v12zm-2-5H3V7h8v2z"></path>
            </svg>
            `;
    }
    /* tslint:enable */
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
