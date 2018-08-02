import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { expectDebugElement } from '../../../../test/helpers/expect-debug-element';
import { NoteSnippetContentDummy } from '../dummies';
import { NoteSnippetContent } from '../shared/note-content.model';
import { NoteCodeSnippetEditorComponent } from './note-code-snippet-editor.component';
import { NoteSnippetEditorConfig } from './note-snippet-editor-config';


describe('browser.note.NoteCodeSnippetEditorComponent', () => {
    let fixture: ComponentFixture<NoteCodeSnippetEditorComponent>;
    let component: NoteCodeSnippetEditorComponent;

    let snippet: NoteSnippetContent;
    let config: NoteSnippetEditorConfig;

    beforeEach(async(() => {
        TestBed
            .configureTestingModule({
                declarations: [NoteCodeSnippetEditorComponent],
            })
            .compileComponents();
    }));

    beforeEach(() => {
        snippet = new NoteSnippetContentDummy().create();
        config = new NoteSnippetEditorConfig();

        fixture = TestBed.createComponent(NoteCodeSnippetEditorComponent);
        component = fixture.componentInstance;
        component.content = snippet;
        component.config = config;
        fixture.detectChanges();
    });

    describe('editor options', () => {
        it('should value to be initial snippet content value.', () => {
            expect(component.getEditorOptions().value).toEqual(snippet.value);
        });
    });

    describe('focus handling', () => {
        it('should focus class exists when editor has been focused.', () => {
            component.focus();
            fixture.detectChanges();

            expectDebugElement(fixture.debugElement)
                .toContainClasses('NoteCodeSnippetEditor--focused');
        });
    });
});
