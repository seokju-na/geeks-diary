import { AxiosResponse } from 'axios';
import { readJson, writeFile, writeJson } from 'fs-extra';
import { EOL } from 'os';
import * as path from 'path';
import * as semver from 'semver';
import { EachApiCallNextApiUrlParser, eachApiCalls } from './utils';


// Interfaces
interface GithubIssue {
    id: string;
    url: string;
    html_url: string;
    number: number;
    state: 'open' | 'closed';
    labels: {
        id: number;
        name: string;
    }[];
    title: string;
    body: string;
    user: {
        login: string;
        url: string;
        avatar_url: string;
        html_url: string;
        type: 'User';
    };
    milestone?: {
        id: string;
        number: number;
        title: string;
        description: string;
        open_issues: number;
        closed_issues: number;
        created_at: string;
        closed_at: string | null;
        due_on: string;
    };
    pull_request?: {
        url: string;
        html_url: string;
    };
    closed_at: string | null;
    created_at: string;
}


type IssueType = 'feature' | 'enhancement' | 'bug' | 'doc' | 'art';
const allIssueTypes: IssueType[] = ['feature', 'enhancement', 'bug', 'doc', 'art'];
const issueTypeEmojiMap = {
    feature: '💡',
    enhancement: '🛠',
    bug: '🔥',
    doc: '📖',
    art: '🎨',
};


interface ChangelogItem {
    types?: IssueType[];
    title: string;
    number: number;
    htmlUrl: string;
}


interface ChangelogOfVersion {
    version: string;
    items: ChangelogItem[];
}


// General functions
const githubNextApiUrlParser: EachApiCallNextApiUrlParser =
    (response: AxiosResponse): string | null => {
        const linkHeader = response.headers.link;

        if (!linkHeader) {
            return null;
        }

        // 'Pages' header values like "<https://some-next-url> rel=next, <https://some-prev-url> rel=prev".
        const pages = (linkHeader as string).split(',');

        if (pages[0] && /rel="next"/.test(pages[0])) {
            const matches = pages[0].match(/<(.+)>/);

            if (matches && matches[1]) {
                return matches[1];
            } else {
                return null;
            }
        }

        return null;
    };


// Application functions
async function getAllPullRequestsForMilestone(milestone: string): Promise<GithubIssue[]> {
    const issues: GithubIssue[] = [];
    const eachGithubIssueApiCalls = eachApiCalls<GithubIssue[]>(
        'https://api.github.com/repos/seokju-na/geeks-diary/issues',
        {
            requestConfig: {
                params: {
                    state: 'closed',
                    milestone,
                },
                headers: {
                    Accept: 'application/vnd.github.v3+json',
                    'User-Agent': 'geeks-diary',
                },
            },
            nextApiUrlParser: githubNextApiUrlParser,
        },
    );

    for await (const data of eachGithubIssueApiCalls) {
        issues.push(...data);
    }

    return issues.filter(issue => !!issue.pull_request);
}


function parsePrToChangelogItem(pr: GithubIssue): ChangelogItem {
    const types: IssueType[] = pr.labels.reduce(
        (reduced, label) => allIssueTypes.includes(label.name as IssueType)
            ? reduced.concat(label.name as IssueType)
            : reduced,
        [],
    );

    return {
        types,
        title: pr.title,
        number: pr.number,
        htmlUrl: pr.pull_request.html_url,
    };
}


function getChangelogOfVersion(changelogs: ChangelogOfVersion[], version: string): ChangelogOfVersion | undefined {
    const cleanVersion = semver.clean(version);
    return changelogs.find(changelog => changelog.version === cleanVersion);
}


function updateChangelogs(
    changelogs: ChangelogOfVersion[],
    version: string,
    prs: GithubIssue[],
): ChangelogOfVersion[] {
    const prevChangelog = getChangelogOfVersion(changelogs, version);
    const newChangelog: ChangelogOfVersion = {
        version: semver.clean(version),
        items: prs.map(parsePrToChangelogItem),
    };

    if (prevChangelog) {
        const index = changelogs.indexOf(prevChangelog);

        changelogs[index] = newChangelog;
    } else {
        changelogs.push(newChangelog);
    }

    // Sort desc by version.
    return changelogs.sort((a, b) => {
        if (semver.gt(a.version, b.version)) {
            return -1;
        } else if (semver.lt(a.version, b.version)) {
            return 1;
        } else {
            return 0;
        }
    });
}


function getMarkdownFromChangelogs(changelogs: ChangelogOfVersion[]): string {
    let content = `# Changelog${EOL}${EOL}`;

    content += `(💡=Feature, 🛠=Enhancement, 🔥=Bug, 📖=Document, 🎨=Art)${EOL}${EOL}`;

    for (const changelog of changelogs) {
        content += `## v${changelog.version}${EOL}`;

        for (const item of changelog.items) {
            const link = `[#${item.number}](${item.htmlUrl})`;
            const labels = item.types.reduce((typeStr, type) => typeStr + issueTypeEmojiMap[type], '');

            content += labels
                ? `- ${link} ${labels} ${item.title}`
                : `- ${link} ${item.title}`;

            content += EOL;
        }
    }

    return content;
}


// Main function
async function main(version: string, milestone: string): Promise<void> {
    if (!milestone) {
        throw new Error('You should input \'milestone\'.');
    }

    const prs = await getAllPullRequestsForMilestone(milestone);

    // Read changelogs and update
    const CHANGELOGS_JSON_FILE = path.resolve(__dirname, '../changelogs.json');
    let changelogs: ChangelogOfVersion[] = await readJson(CHANGELOGS_JSON_FILE, { throws: true });

    changelogs = updateChangelogs(changelogs, version, prs);

    await writeJson(CHANGELOGS_JSON_FILE, changelogs);

    // Write changelog markdown.
    const CHANGELOG_MARKDOWN_FILE = path.resolve(__dirname, '../CHANGELOG.md');
    const content = getMarkdownFromChangelogs(changelogs);

    await writeFile(CHANGELOG_MARKDOWN_FILE, content);
}


const appVersion = (require('../src/package.json') as any).version;

main(appVersion, process.argv[2])
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
