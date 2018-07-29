import { Injectable } from '@angular/core';
import * as os from 'os';
import * as Remarkable from 'remarkable';
import * as yaml from 'js-yaml';
import { Note, NoteMetadata } from '../../../models/note';
import { NoteSnippetTypes } from '../../../models/note-snippet';
import { NoteContent, NoteSnippetContent } from './note-content.model';
import {
    NoteContentParseResult,
    NoteContentRawValueParseResult,
    NoteSnippetParseResult,
} from './note-parsing.models';
import remarkableMetaPlugin = require('remarkable-meta');


const getMdTitle = require('get-md-title') as (content: string) =>
    { text: string } | undefined;


export class NoteContentParsingOptions {
    readonly indent?: number = 4;
    readonly lineSpacing?: number = 2;
    readonly metadata?: NoteMetadata | null = null;
}


const isEmptyLine = (line: string) => line.trim() === '';
const getLastLine = (lines: string[]) => lines[lines.length - 1];
const numToArray = (count: number) => {
    const arr = [];
    for (let i = 0; i < count; i++) {
        arr.push(i + 1);
    }
    return arr;
};


@Injectable()
export class NoteParser {
    private markdownParser: Remarkable;

    generateNoteContent(note: Note, contentRawValue: string): NoteContent {
        if (!contentRawValue) {
            return null;
        }

        const lines = contentRawValue.split(os.EOL);
        const snippets: NoteSnippetContent[] = [];

        for (const snippet of note.snippets) {
            const startIndex = snippet.startLineNumber - 1;
            const endIndex = snippet.endLineNumber - 1;

            const value = lines.slice(startIndex, endIndex + 1).join(os.EOL);
            let snippetContent: NoteSnippetContent = {
                type: snippet.type,
                value,
            };

            if (snippet.type === NoteSnippetTypes.CODE) {
                snippetContent = {
                    ...snippetContent,
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

    private _parseTokens = function* parseTokens(
        lines: string[],
        _tokens: Remarkable.Token[],
    ): IterableIterator<NoteSnippetParseResult> {
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
                        value: lines.slice(startLine, endLine).join('\n'),
                        startLineNumber: startLine + 1,
                        endLineNumber: endLine,
                    };
                }

                [startLine, endLine] = tokens[i].lines;

                yield {
                    type: NoteSnippetTypes.CODE,
                    value: lines.slice(...tokens[i].lines).join('\n'),
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
                        value: lines.slice(startLine, endLine).join('\n'),
                        startLineNumber: startLine + 1,
                        endLineNumber: endLine,
                    };
                }
            }
        }
    };

    parseNoteContentRawValue(contentRawValue: string): NoteContentRawValueParseResult {
        this.initMarkdownParser();

        const snippets = [];
        const lines = contentRawValue.split('\n');
        const tokens = this.markdownParser.parse(contentRawValue, { breaks: true });

        for (const snippet of this._parseTokens(lines, tokens)) {
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
        };

        let metadataLines: string[];

        if (opts.metadata) {
            const metadata = yaml.safeDump(opts.metadata, {
                indent: opts.indent,
            });

            metadataLines = metadata.split(os.EOL);

            // If last line is empty, discard last line.
            if (isEmptyLine(getLastLine(metadataLines))) {
                metadataLines = metadataLines.slice(0, metadataLines.length - 1);
            }
        }

        let str = '';
        const nl = os.EOL;
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

        // Add each snippet value to note content raw value.
        for (const snippet of content.snippets) {
            str += `${snippet.value}${lineSpacing}`;
        }

        // Parse tokens to get parsed snippet.
        const parsedSnippets = [];

        this.initMarkdownParser();
        const tokens = this.markdownParser.parse(str, { breaks: true });

        for (const parsedSnippet of this._parseTokens(str.split(nl), tokens)) {
            parsedSnippets.push(parsedSnippet);
        }

        return {
            parsedSnippets,
            contentRawValue: str,
        };
    }

    private initMarkdownParser(): void {
        if (this.markdownParser) {
            this.markdownParser = null;
        }

        this.markdownParser = new Remarkable();
        this.markdownParser.use(remarkableMetaPlugin);
    }
}
