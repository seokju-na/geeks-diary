import { TestBed } from '@angular/core/testing';
import { fastTestSetup } from '../../../../test/helpers';
import { basicFixture } from '../fixtures';
import { NoteParser } from './note-parser';
import { convertToNoteContentSnippets, convertToNoteSnippets } from './note-parsing.model';


describe('browser.note.NoteParser', () => {
    let parser: NoteParser;

    fastTestSetup();

    beforeAll(() => {
        TestBed
            .configureTestingModule({
                providers: [NoteParser],
            });
    });

    beforeEach(() => {
        parser = TestBed.get(NoteParser);
    });

    describe('generateNoteContent', () => {
        it('basic fixture', () => {
            const result = parser.generateNoteContent(
                basicFixture.note,
                basicFixture.contentRawValue,
            );

            expect(result.noteId).toEqual(basicFixture.note.id);

            result.snippets.forEach((snippet, index) => {
                const target = basicFixture.content.snippets[index];

                expect(snippet.type).toEqual(target.type);
                expect(snippet.value).toEqual(target.value);
                expect(snippet.codeLanguageId).toEqual(target.codeLanguageId);
                expect(snippet.codeFileName).toEqual(target.codeFileName);
            });
        });
    });

    describe('parseNoteContentRawValue', () => {
        it('basic fixture', () => {
            const result = parser.parseNoteContentRawValue(basicFixture.contentRawValue);

            expect(convertToNoteSnippets(result.parsedSnippets)).toEqual(basicFixture.noteItem.snippets);
            expect(convertToNoteContentSnippets(result.parsedSnippets)).toEqual(basicFixture.content.snippets);
        });
    });

    describe('parseNoteContent', () => {
        it('basic fixture', () => {
            const result = parser.parseNoteContent(basicFixture.content, {
                lineSpacing: basicFixture.lineSpacing,
                metadata: {
                    title: basicFixture.title,
                    date: basicFixture.dateStr,
                    stacks: basicFixture.stackIds,
                },
            });

            expect(result.contentRawValue).toEqual(basicFixture.contentParsedValue);

            result.parsedSnippets.forEach((parsedSnippet, index) => {
                const snippet = basicFixture.afterNote.snippets[index];

                expect(parsedSnippet.startLineNumber).toEqual(snippet.startLineNumber);
                expect(parsedSnippet.endLineNumber).toEqual(snippet.endLineNumber);
            });
        });
    });
});
