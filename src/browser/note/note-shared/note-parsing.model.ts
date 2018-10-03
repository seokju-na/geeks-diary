import { NoteSnippet, NoteSnippetTypes } from '../../../core/note';
import { NoteSnippetContent } from '../note-editor';


export type NoteSnippetParseResult = (NoteSnippet & NoteSnippetContent);


export interface NoteContentRawValueParseResult {
    title: string;
    stackIds?: string[];
    parsedSnippets: NoteSnippetParseResult[];
    createdDatetime?: number;
}


export interface NoteContentParseResult {
    parsedSnippets: NoteSnippetParseResult[];
    contentRawValue: string;
}


export function convertToNoteSnippets(
    parsedSnippets: NoteSnippetParseResult[],
): NoteSnippet[] {
    const snippets: NoteSnippet[] = [];

    for (const parsedSnippet of parsedSnippets) {
        let snippet: NoteSnippet = {
            type: parsedSnippet.type,
            startLineNumber: parsedSnippet.startLineNumber,
            endLineNumber: parsedSnippet.endLineNumber,
        };

        if (parsedSnippet.type === NoteSnippetTypes.CODE) {
            snippet = {
                ...snippet,
                codeLanguageId: parsedSnippet.codeLanguageId,
                codeFileName: parsedSnippet.codeFileName,
            };
        }

        snippets.push(snippet);
    }

    return snippets;
}


export function convertToNoteContentSnippets(
    parsedSnippets: NoteSnippetParseResult[],
): NoteSnippetContent[] {
    const snippets: NoteSnippetContent[] = [];

    for (const parsedSnippet of parsedSnippets) {
        let snippet: NoteSnippetContent = {
            type: parsedSnippet.type,
            value: parsedSnippet.value,
        };

        if (parsedSnippet.type === NoteSnippetTypes.CODE) {
            snippet = {
                ...snippet,
                codeLanguageId: parsedSnippet.codeLanguageId,
                codeFileName: parsedSnippet.codeFileName,
            };
        }

        snippets.push(snippet);
    }

    return snippets;
}
