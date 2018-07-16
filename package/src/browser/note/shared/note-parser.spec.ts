import { TestBed } from '@angular/core/testing';
import {
    basicFixture,
    codeSnippetsOnlyFixture,
    frontMatterFixture,
    frontMatterInvalidDateFixture,
    frontMatterNoTitleFixture,
    textSnippetsOnlyFixture,
} from '../fixtures';
import { NoteParser } from './note-parser';


describe('browser.note.NoteParser', () => {
    let parser: NoteParser;

    beforeEach(() => {
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
            const fixture = basicFixture();
            const result = parser.generateNoteContent(
                fixture.note,
                fixture.contentRawValue,
            );

            expect(result.noteId).toEqual(fixture.note.id);
            expect(result.snippets).toEqual(fixture.snippetContents);
        });

        it('text snippets only fixture', () => {
            const fixture = textSnippetsOnlyFixture();
            const result = parser.generateNoteContent(
                fixture.note,
                fixture.contentRawValue,
            );

            expect(result.noteId).toEqual(fixture.note.id);
            expect(result.snippets).toEqual(fixture.snippetContents);
        });

        it('code snippets only fixture', () => {
            const fixture = codeSnippetsOnlyFixture();
            const result = parser.generateNoteContent(
                fixture.note,
                fixture.contentRawValue,
            );

            expect(result.noteId).toEqual(fixture.note.id);
            expect(result.snippets).toEqual(fixture.snippetContents);
        });
    });

    describe('parseNoteContentRawValue', () => {
        it('basic fixture', () => {
            const fixture = basicFixture();
            const result = parser.parseNoteContentRawValue(fixture.contentRawValue);

            expect(result.snippets).toEqual(fixture.snippetContents);
        });

        it('text snippets only fixture', () => {
            const fixture = textSnippetsOnlyFixture();
            const result = parser.parseNoteContentRawValue(fixture.contentRawValue);

            expect(result.snippets).toEqual(fixture.snippetContents);
        });

        it('code snippets only fixture', () => {
            const fixture = codeSnippetsOnlyFixture();
            const result = parser.parseNoteContentRawValue(fixture.contentRawValue);

            expect(result.snippets).toEqual(fixture.snippetContents);
        });

        describe('front matter', () => {
            it('should set title, stacks, created datetime in front matter.', () => {
                const fixture = frontMatterFixture();
                const result = parser.parseNoteContentRawValue(
                    fixture.contentRawValue,
                );

                expect(result.title).toEqual(fixture.note.title);
                expect(result.stackIds).toEqual(fixture.note.stackIds);
                expect(result.createdDatetime).toEqual(fixture.note.createdDatetime);
                expect(result.snippets).toEqual(fixture.snippetContents);
            });

            it('should set title from first header if title is not exists in ' +
                'front matter metadata.', () => {
                const fixture = frontMatterNoTitleFixture();
                const result = parser.parseNoteContentRawValue(
                    fixture.contentRawValue,
                );

                expect(result.title).toEqual(fixture.note.title);
                expect(result.stackIds).toEqual(fixture.note.stackIds);
                expect(result.createdDatetime).toEqual(fixture.note.createdDatetime);
                expect(result.snippets).toEqual(fixture.snippetContents);
            });

            it('should created datetime to be null if date is invalid which ' +
                'from front matter metadata.', () => {
                const fixture = frontMatterInvalidDateFixture();
                const result = parser.parseNoteContentRawValue(
                    fixture.contentRawValue,
                );

                expect(result.createdDatetime).toEqual(null);
                expect(result.snippets).toEqual(fixture.snippetContents);
            });
        });
    });
});
