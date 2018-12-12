import { Injectable } from '@angular/core';
import * as hljs from 'highlight.js';
import * as yaml from 'js-yaml';
import { EOL } from 'os';
import * as path from 'path';
import * as Remarkable from 'remarkable';
import { escapeHtml, replaceEntities, unescapeMd } from 'remarkable/lib/common/utils';
import { Note, NoteMetadata, NoteSnippetTypes } from '../../../core/note';
import { WorkspaceService } from '../../shared';
import { NoteContent, NoteSnippetContent } from '../note-editor';
import { NoteContentParseResult, NoteContentRawValueParseResult, NoteSnippetParseResult } from './note-parsing.model';
import remarkableMetaPlugin = require('remarkable-meta');


const getMdTitle = require('get-md-title') as (content: string) => { text: string } | undefined;


export class NoteContentParsingOptions {
    readonly indent?: number = 4;
    readonly lineSpacing?: number = 2;
    readonly metadata?: NoteMetadata | null = null;
}


@Injectable()
export class NoteParser {
    private readonly markdownParser: Remarkable;

    constructor(private workspace: WorkspaceService) {
        this.markdownParser = new Remarkable({
            highlight: (str, lang) => {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(lang, str).value;
                    } catch (err) {
                    }
                }

                try {
                    return hljs.highlightAuto(str).value;
                } catch (err) {
                }

                return ''; // use external default escaping
            },
        });

        this.markdownParser.use(remarkableMetaPlugin);

        overrideMarkdownParseToAdaptLink(this.markdownParser, this.workspace.configs.assetsDirPath);
    }

    generateNoteContent(note: Note, contentRawValue: string): NoteContent {
        if (!contentRawValue) {
            return null;
        }

        const lines = contentRawValue.split(EOL);
        const snippets: NoteSnippetContent[] = [];

        for (const snippet of note.snippets) {
            const startIndex = snippet.startLineNumber - 1;
            const endIndex = snippet.endLineNumber - 1;

            const value = lines.slice(startIndex, endIndex + 1).join(EOL);
            let snippetContent: NoteSnippetContent = {
                type: snippet.type,
                value,
            };

            if (snippet.type === NoteSnippetTypes.CODE) {
                snippetContent = {
                    ...snippetContent,
                    value: lines.slice(startIndex + 1, endIndex).join(EOL), // Remove first and last line.
                    codeLanguageId: snippet.codeLanguageId,
                    codeFileName: snippet.codeFileName,
                };
            }

            snippets.push(snippetContent);
        }

        return {
            noteId: note.id,
            snippets,
        };
    }

    parseNoteContentRawValue(contentRawValue: string): NoteContentRawValueParseResult {
        const snippets = [];
        const lines = contentRawValue.split('\n');
        const tokens = this.markdownParser.parse(contentRawValue, { breaks: true });

        for (const snippet of parseTokens(lines, tokens)) {
            snippets.push(snippet);
        }

        /**
         * When parsing the Markdown text, the Front matter data is parsed
         * together by the plugin named 'remarkable-meta'.
         *
         * The data is stored in the 'meta' property, but is not typed in
         * Typescript.
         *
         * See
         *  https://github.com/eugeneware/remarkable-meta
         */
        const metadata = (<any>this.markdownParser).meta as NoteMetadata;

        /**
         * 'get-md-title' fetches the first header of the Markdown content
         * as the first header.
         *
         * We will use note title by priority.
         *  1. The title stated in Front matter
         *  2. First header of content
         */
        const firstHeaderTitle = getMdTitle(contentRawValue);
        const title = metadata.title
            ? metadata.title
            : firstHeaderTitle
                ? firstHeaderTitle.text
                : 'No Title';

        const stacks = metadata.stacks
            ? metadata.stacks
            : [];

        const createdDatetime = !metadata.date
            ? null
            : !Number.isNaN(Date.parse(metadata.date))
                ? Date.parse(metadata.date)
                : null;

        return {
            title,
            parsedSnippets: [...snippets],
            stackIds: stacks,
            createdDatetime,
        };
    }

    parseNoteContent(
        content: NoteContent,
        options?: NoteContentParsingOptions,
    ): NoteContentParseResult {
        const opts = {
            ...(new NoteContentParsingOptions()),
            ...options,
        } as NoteContentParsingOptions;

        let metadataLines: string[];

        if (opts.metadata) {
            const metadata = yaml.safeDump(opts.metadata, {
                indent: opts.indent,
            });

            metadataLines = metadata.split(EOL);

            // If last line is empty, discard last line.
            if (isEmptyLine(getLastLine(metadataLines))) {
                metadataLines = metadataLines.slice(0, metadataLines.length - 1);
            }
        }

        let str = '';
        let startLine: number;
        let endLine: number;
        const nl = EOL;
        const lineSpacing = numToArray(opts.lineSpacing)
            .reduce(sum => `${sum}${nl}`, nl);

        // Add front matter to note content raw value if exists.
        if (metadataLines) {
            str +=
                `---${nl}` +
                `${metadataLines.join(nl)}${nl}` +
                `---${nl}` +
                `${nl}`;
        }

        // Parse tokens to get parsed snippet.
        const parsedSnippets: NoteSnippetParseResult[] = [];

        startLine = endLine = str.split(EOL).length;

        // Add each snippet value to note content raw value.
        for (const snippet of content.snippets) {
            if (snippet.type === NoteSnippetTypes.CODE) {
                str += '```';

                if (snippet.codeLanguageId) {
                    str += snippet.codeLanguageId;
                }

                str += '\n';
                endLine += 1; // Add 1 line.
            }

            str += snippet.value;
            endLine += snippet.value.split(EOL).length - 1;

            if (snippet.type === NoteSnippetTypes.CODE) {
                str += '\n```';
                endLine += 1;
            }

            parsedSnippets.push({
                ...snippet,
                startLineNumber: startLine,
                endLineNumber: endLine,
            });

            str += lineSpacing;
            startLine = endLine = endLine + opts.lineSpacing + 1;
        }

        return {
            parsedSnippets,
            contentRawValue: str,
        };
    }

    convertSnippetContentToHtml(snippet: NoteSnippetContent): string {
        let value: string;

        if (snippet.type === NoteSnippetTypes.CODE) {
            value = (snippet.codeLanguageId ? `\`\`\`${snippet.codeLanguageId}\n` : '```\n')
                + snippet.value
                + '\n```';
        } else if (snippet.type === NoteSnippetTypes.TEXT) {
            value = snippet.value;
        }

        return this.markdownParser.render(value);
    }
}


function* parseTokens(lines: string[], _tokens: Remarkable.Token[]): IterableIterator<NoteSnippetParseResult> {
    let start = 0;
    let end = 0;
    let startLine;
    let endLine;

    // We only need content token.
    // Occasionally, content token does not have 'lines' property.
    // Therefore, ensure token validation by checking 'lines' property.
    const tokens = _tokens.filter(token =>
        !!token.lines && !!(<any>token).content);

    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].type === 'fence') {
            if (start !== i && end !== i) {
                startLine = tokens[start].lines[0];
                endLine = tokens[end].lines[1];

                yield {
                    type: NoteSnippetTypes.TEXT,
                    value: lines.slice(startLine, endLine).join(EOL),
                    startLineNumber: startLine + 1,
                    endLineNumber: endLine,
                };
            }

            [startLine, endLine] = tokens[i].lines;

            yield {
                type: NoteSnippetTypes.CODE,
                value: lines.slice(startLine + 1, endLine - 1).join(EOL), // Remove first and last line.
                startLineNumber: startLine + 1,
                endLineNumber: endLine,
                codeLanguageId: (<any>tokens[i]).params,
                codeFileName: '',
            };

            start = i + 1;
            end = i + 1;
        } else {
            end = i;

            if (i === tokens.length - 1) {
                startLine = tokens[start].lines[0];
                endLine = tokens[end].lines[1];

                yield {
                    type: NoteSnippetTypes.TEXT,
                    value: lines.slice(startLine, endLine).join(EOL),
                    startLineNumber: startLine + 1,
                    endLineNumber: endLine,
                };
            }
        }
    }
}


function overrideMarkdownParseToAdaptLink(md: Remarkable, assetDir: string): void {
    md.renderer.rules.image = (tokens, idx, options /*, env */) => {
        const srcUrl = path.resolve(assetDir, path.basename(tokens[idx].src));

        const src = ' src="' + escapeHtml(srcUrl) + '"';
        const title = tokens[idx].title ? (' title="' + escapeHtml(replaceEntities(tokens[idx].title)) + '"') : '';
        const alt = ' alt="' + (tokens[idx].alt ? escapeHtml(replaceEntities(unescapeMd(tokens[idx].alt))) : '') + '"';
        const suffix = options.xhtmlOut ? ' /' : '';

        // noinspection HtmlRequiredAltAttribute
        return '<img' + src + alt + title + suffix + '>';
    };
}


/** Check if line is empty. */
function isEmptyLine(line: string): boolean {
    return line.trim() === '';
}


/** Get last element of lines. */
function getLastLine(lines: string[]): string {
    return lines[lines.length - 1];
}


/** Simple convert number to array. */
function numToArray(count: number): number[] {
    const arr = [];
    for (let i = 0; i < count; i++) {
        arr.push(i + 1);
    }
    return arr;
}
