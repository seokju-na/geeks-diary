import { TestBed } from '@angular/core/testing';
import { expectDom, fastTestSetup } from '../../../../test/helpers';
import { NoteSnippetTypes } from '../../../core/note';
import { SharedModule, WORKSPACE_DEFAULT_CONFIG, WorkspaceConfig } from '../../shared';
import { basicFixture } from '../fixtures';
import { NoteSnippetContent } from '../note-editor';
import { NoteParser } from './note-parser';
import { convertToNoteContentSnippets, convertToNoteSnippets } from './note-parsing.model';


describe('browser.note.NoteParser', () => {
    let parser: NoteParser;

    const workspaceConfig: WorkspaceConfig = {
        rootDirPath: '/test/workspace/',
    };

    fastTestSetup();

    beforeAll(() => {
        TestBed
            .configureTestingModule({
                imports: [SharedModule],
                providers: [
                    { provide: WORKSPACE_DEFAULT_CONFIG, useValue: workspaceConfig },
                    NoteParser,
                ],
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

    describe('convertSnippetContentToHtml', () => {
        it('should prepend workspace root url to image source.', () => {
            const snippet: NoteSnippetContent = {
                type: NoteSnippetTypes.TEXT,
                value: '![Image](images/my-awesome-image.png)',
            };

            const rendered = parser.convertSnippetContentToHtml(snippet);

            // noinspection HtmlUnknownTarget
            expect(rendered).toContain(
                '<p><img src="/test/workspace/images/my-awesome-image.png" alt="Image"></p>',
            );
        });

        it('should convert to code block with syntax highlight if type of snippet is \'CODE\'.', () => {
            const snippet: NoteSnippetContent = {
                type: NoteSnippetTypes.CODE,
                value: 'console.log(\'Hello World\');',
                codeLanguageId: 'javascript',
            };

            const rendered = parser.convertSnippetContentToHtml(snippet);
            const dom = document.createElement('div');

            dom.innerHTML = rendered;

            expectDom(dom.querySelector('code')).toContainClasses('language-javascript');
        });
    });
});
