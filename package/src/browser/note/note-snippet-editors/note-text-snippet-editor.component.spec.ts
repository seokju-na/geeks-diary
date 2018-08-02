import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { expectDebugElement } from '../../../../test/helpers/expect-debug-element';
import { NoteSnippetContentDummy } from '../dummies';
import { NoteSnippetContent } from '../shared/note-content.model';
import { NoteSnippetEditorConfig } from './note-snippet-editor-config';
import { NoteTextSnippetEditorComponent } from './note-text-snippet-editor.component';


describe('browser.note.NoteTextSnippetEditorComponent', () => {
    let fixture: ComponentFixture<NoteTextSnippetEditorComponent>;
    let component: NoteTextSnippetEditorComponent;

    let snippet: NoteSnippetContent;
    let config: NoteSnippetEditorConfig;

    beforeEach(async(() => {
        TestBed
            .configureTestingModule({
                declarations: [NoteTextSnippetEditorComponent],
            })
            .compileComponents();
    }));

    beforeEach(() => {
        snippet = new NoteSnippetContentDummy().create();
        config = new NoteSnippetEditorConfig();

        fixture = TestBed.createComponent(NoteTextSnippetEditorComponent);
        component = fixture.componentInstance;
        component.content = snippet;
        component.config = config;
        fixture.detectChanges();
    });

    describe('editor options', () => {
        it('should value to be initial snippet content value.', () => {
            expect(component.getEditorOptions().value).toEqual(snippet.value);
        });

        it('should mode to be \'markdown\'.', () => {
            expect(component.getEditorOptions().mode).toEqual('markdown');
        });
    });

    describe('focus handling', () => {
        it('should focus class exists when editor has been focused.', () => {
            component.focus();
            fixture.detectChanges();

            expectDebugElement(fixture.debugElement)
                .toContainClasses('NoteTextSnippetEditor--focused');
        });
    });
});
