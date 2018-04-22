import { inject, TestBed } from '@angular/core/testing';
import { NoteContentSnippetDummyFactory } from '../../note/dummies';
import { NoteContentSnippet } from '../../note/models';
import { EDITOR_SNIPPET_CONFIG, EDITOR_SNIPPET_REF } from './snippet';
import { EditorSnippetFactory } from './snippet-factory';


describe('app.editor.snippet.EditorSnippetFactory', () => {
    let snippetFactory: EditorSnippetFactory;
    let content: NoteContentSnippet;

    beforeEach(() => {
        content = new NoteContentSnippetDummyFactory().create();
    });

    beforeEach(() => {
        TestBed
            .configureTestingModule({
                providers: [EditorSnippetFactory],
            });
    });

    beforeEach(inject(
        [EditorSnippetFactory],
        (e: EditorSnippetFactory) => {
            snippetFactory = e;
        },
    ));

    describe('createFromNoteContentSnippet', () => {
        it('should snippet reference has snippet config provider ' +
            'in isolated injector.', () => {

            const ref = snippetFactory.create(content);
            const config = EditorSnippetFactory.makeConfig(content, false);

            expect(ref.outlet.injector.get(EDITOR_SNIPPET_CONFIG)).toEqual(config);
        });

        it('should snippet reference has its reference provider ' +
            'in isolated injector.', () => {

            const ref = snippetFactory.create(content);

            expect(ref.outlet.injector.get(EDITOR_SNIPPET_REF)).toEqual(ref);
        });
    });
});
