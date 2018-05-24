import { inject, TestBed } from '@angular/core/testing';
import { NoteContentSnippetDummyFactory } from '../../dummies';
import { NoteContentSnippet } from '../../models';
import { NOTE_EDITOR_SNIPPET_CONFIG, NOTE_EDITOR_SNIPPET_REF } from './snippet';
import { NoteEditorSnippetFactory } from './snippet-factory';


describe('app.note.editor.snippet.EditorSnippetFactory', () => {
    let snippetFactory: NoteEditorSnippetFactory;
    let content: NoteContentSnippet;

    beforeEach(() => {
        content = new NoteContentSnippetDummyFactory().create();
    });

    beforeEach(() => {
        TestBed
            .configureTestingModule({
                providers: [NoteEditorSnippetFactory],
            });
    });

    beforeEach(inject(
        [NoteEditorSnippetFactory],
        (e: NoteEditorSnippetFactory) => {
            snippetFactory = e;
        },
    ));

    describe('createFromNoteContentSnippet', () => {
        it('should snippet reference has snippet config provider ' +
            'in isolated injector.', () => {

            const ref = snippetFactory.createWithContent(content);
            const config = NoteEditorSnippetFactory.makeConfig(content, false);

            expect(ref.outlet.injector.get(NOTE_EDITOR_SNIPPET_CONFIG)).toEqual(config);
        });

        it('should snippet reference has its reference provider ' +
            'in isolated injector.', () => {

            const ref = snippetFactory.createWithContent(content);

            expect(ref.outlet.injector.get(NOTE_EDITOR_SNIPPET_REF)).toEqual(ref);
        });
    });
});
