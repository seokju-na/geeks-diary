import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expectDom, fastTestSetup } from '../../../../../test/helpers';
import { NoteSnippetTypes } from '../../../../core/note';
import { NoteSnippetEditorConfig, NoteSnippetEditorRef } from '../note-snippet-editor';
import { NoteTextSnippetEditorComponent } from './note-text-snippet-editor.component';


describe('browser.note.noteEditor.NoteTextSnippetEditorComponent', () => {
    let fixture: ComponentFixture<NoteTextSnippetEditorComponent>;
    let component: NoteTextSnippetEditorComponent;

    fastTestSetup();

    beforeAll(async () => {
        const config = new NoteSnippetEditorConfig();
        config.type = NoteSnippetTypes.TEXT;

        const ref = new NoteSnippetEditorRef<NoteTextSnippetEditorComponent>(config);

        await TestBed
            .configureTestingModule({
                providers: [
                    { provide: NoteSnippetEditorRef, useValue: ref },
                    { provide: NoteSnippetEditorConfig, useValue: config },
                ],
                declarations: [
                    NoteTextSnippetEditorComponent,
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(NoteTextSnippetEditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should contains \'NoteTextSnippetEditor\' class in host element.', () => {
        expectDom(fixture.debugElement.nativeElement as HTMLElement)
            .toContainClasses('NoteTextSnippetEditor');
    });

    it('should implement \'editorHostEl\' abstraction.', () => {
        expect(component.editorHostEl).toBeDefined();
    });
});
