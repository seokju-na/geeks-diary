import { VcsAccount, VcsAuthenticationInfo } from './vcs';


type Protocol = 'ssh' | 'https';


export interface GitRemoteUrl {
    readonly protocol: Protocol;

    /** The hostname of the remote. */
    readonly hostname: string;

    /**
     * The owner of the GitHub repository. This will be null if the URL doesn't
     * take the form of a GitHub repository URL (e.g., owner/name).
     */
    readonly owner: string | null;

    /**
     * The name of the GitHub repository. This will be null if the URL doesn't
     * take the form of a GitHub repository URL (e.g., owner/name).
     */
    readonly name: string | null;
}



// Examples:
// https://github.com/octocat/Hello-World.git
// https://github.com/octocat/Hello-World.git/
// git@github.com:octocat/Hello-World.git
// git:github.com/octocat/Hello-World.git
const gitRemoteRegexps: { protocol: Protocol; regex: RegExp }[] = [
    {
        protocol: 'https',
        regex: new RegExp('^https?://(?:.+@)?(.+)/(.+)/(.+?)(?:/|.git/?)?$'),
    },
    {
        protocol: 'ssh',
        regex: new RegExp('^git@(.+):(.+)/(.+?)(?:/|.git)?$'),
    },
    {
        protocol: 'ssh',
        regex: new RegExp('^git:(.+)/(.+)/(.+?)(?:/|.git)?$'),
    },
    {
        protocol: 'ssh',
        regex: new RegExp('^ssh://git@(.+)/(.+)/(.+?)(?:/|.git)?$'),
    },
];


/** Parse the remote information from URL. */
export function parseGitRemoteUrl(url: string): GitRemoteUrl | null {
    for (const { protocol, regex } of gitRemoteRegexps) {
        const result = url.match(regex);

        if (!result) {
            continue;
        }

        const hostname = result[1];
        const owner = result[2];
        const name = result[3];

        if (hostname) {
            return { protocol, hostname, owner, name };
        }
    }

    return null;
}


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
            return 'Authentication failed. Please check your credential.';

        default:
            return 'Unknown Error';
    }
}


export interface GitCloneOptions {
    url: string;
    localPath: string;
    authentication?: VcsAuthenticationInfo;
}


export interface GitCommitOptions {
    workspaceDirPath: string;
    message: string;
    filesToAdd: string[];
    author: VcsAccount;
}
