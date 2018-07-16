import { Injectable } from '@angular/core';
import * as os from 'os';
import { Note } from '../../../models/note';
import { NoteSnippetTypes } from '../../../models/note-snippet';
import { NoteModule } from '../note.module';
import { NoteContent, NoteSnippetContent } from './note-content.model';
import getMdTitle = require('get-md-title');
import Remarkable = require('remarkable');


interface NoteContentRawValueParseResult {
    title: string;
    stackIds: string[];
    snippets: NoteSnippetContent[];
    createdDatetime?: number;
}


const md = new Remarkable();
md.use(require('remarkable-meta'));


@Injectable({
    providedIn: NoteModule,
})
export class NoteParser {
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

            snippets.push({
                ...snippet,
                value,
            });
        }

        return {
            noteId: note.id,
            snippets,
        };
    }

    private _parseTokens = function* parseLine(
        lines: string[],
        _tokens: Remarkable.Token[],
    ): IterableIterator<NoteSnippetContent> {
        let start = 0;
        let end = 0;
        let startLine;
        let endLine;

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
        const snippets: NoteSnippetContent[] = [];
        const lines = contentRawValue.split('\n');
        const tokens = md.parse(contentRawValue, { breaks: true });
        const metadata = (<any>md).meta;

        for (const snippet of this._parseTokens(lines, tokens)) {
            snippets.push(snippet);
        }

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
            snippets: [...snippets],
            stackIds: stacks,
            createdDatetime,
        };
    }

    // TODO: Test and implement this method.
    makeContentToRawValue(content: NoteContent): string {
        return null;
    }
}
