// Sources from 'https://github.com/desktop/desktop.git'.
// See details: https://github.com/desktop/desktop/blob/master/app/src/lib/remote-parsing.ts


type Protocol = 'ssh' | 'https';

interface RemoteUrl {
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
const remoteRegexes: ReadonlyArray<{ protocol: Protocol; regex: RegExp }> = [
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
export function parseRemoteUrl(url: string): RemoteUrl | null {
    for (const { protocol, regex } of remoteRegexes) {
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
