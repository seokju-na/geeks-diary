/** The git errors which can be parsed from failed git commands. */
import { AuthenticationInfo } from '../models/authentication-info';


export enum GitErrorCodes {
    AUTHENTICATION_FAIL = 'AUTHENTICATION_FAIL',
}


/* tslint:disable */
/** A mapping from regexes to the git error they identify. */
export const gitErrorRegexes: {[key: string]: RegExp} = {
    [GitErrorCodes.AUTHENTICATION_FAIL]: /authentication required/,
};
/* tslint:enable */


export class GitError extends Error {
    readonly errorDescription: string;

    constructor(public readonly code: any) {
        super(getDescriptionForError(code));

        this.name = 'GitError';
        this.errorDescription = getDescriptionForError(code);
    }
}


function getDescriptionForError(code: GitErrorCodes): string {
    switch (code) {
        case GitErrorCodes.AUTHENTICATION_FAIL:
            return 'Authentication Failed';

        default:
            return 'Unknown Error';
    }
}


export interface GitCloneOptions {
    url: string;
    localPath: string;
    authentication?: AuthenticationInfo;
}
