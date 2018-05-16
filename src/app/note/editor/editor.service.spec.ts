import { inject, TestBed } from '@angular/core/testing';
import { createDummyList } from '../../../testing/dummy';
import { NoteContentDummyFactory, NoteContentSnippetDummyFactory } from '../dummies';
import { NoteContent, NoteContentSnippet } from '../models';
import { NoteEditorService } from './editor.service';
import { NOTE_EDITOR_SNIPPET_CONFIG } from './snippet/snippet';
import { NoteEditorSnippetFactory } from './snippet/snippet-factory';


describe('app.note.editor.EditorService', () => {
    let editorService: NoteEditorService;

    beforeEach(() => {
        TestBed
            .configureTestingModule({
                providers: [
                    NoteEditorSnippetFactory,
                    NoteEditorService,
                ],
            });
    });

    beforeEach(inject(
        [NoteEditorService],
        (e: NoteEditorService) => {
            editorService = e;
        },
    ));

    describe('initFromNoteContent', () => {
        let content: NoteContent;

        beforeEach(() => {
            content = new NoteContentDummyFactory().create();
        });

        it('should create snippet references.', () => {
            editorService.initFromNoteContent(content);

            expect(editorService.snippetRefs.length).toEqual(content.snippets.length);
        });
    });

    describe('insertNewSnippetRef', () => {
        let initialSnippets: NoteContentSnippet[];
        let newContentSnippet: NoteContentSnippet;

        beforeEach(() => {
            initialSnippets = createDummyList(
                new NoteContentSnippetDummyFactory('initialNoteContentSnippet'), 5);
            newContentSnippet = new NoteContentSnippetDummyFactory().create();

            editorService.initFromNoteContent(new NoteContentDummyFactory().create(
                'note1',
                initialSnippets,
            ));
        });

        it('should insert new snippet after target snippet.', () => {
            const targetId = initialSnippets[2].id;
            editorService.insertNewSnippetRef(targetId, newContentSnippet);

            const newSnippetRef = editorService.snippetRefs[3];
            expect(newSnippetRef.id).toEqual(newContentSnippet.id);

            const config = newSnippetRef.outlet.injector.get(NOTE_EDITOR_SNIPPET_CONFIG);
            expect(config.isNewSnippet).toEqual(true);
        });
    });
});
