import { ComponentFixture, TestBed } from '@angular/core/testing';
import { fastTestSetup } from '../../../../../test/helpers';
import { NoteSnippetTypes } from '../../../../core/note';
import { StackModule } from '../../../stack';
import { NoteSnippetEditorConfig, NoteSnippetEditorRef } from '../note-snippet-editor';
import { NoteCodeSnippetEditorComponent } from './note-code-snippet-editor.component';


describe('browser.note.noteEditor.NoteCodeSnippetEditorComponent', () => {
    let fixture: ComponentFixture<NoteCodeSnippetEditorComponent>;
    let component: NoteCodeSnippetEditorComponent;

    fastTestSetup();

    beforeAll(async () => {
        const config = new NoteSnippetEditorConfig();
        config.type = NoteSnippetTypes.CODE;

        const ref = new NoteSnippetEditorRef<NoteCodeSnippetEditorComponent>(config);

        await TestBed
            .configureTestingModule({
                imports: [
                    StackModule,
                ],
                providers: [
                    { provide: NoteSnippetEditorRef, useValue: ref },
                    { provide: NoteSnippetEditorConfig, useValue: config },
                ],
                declarations: [
                    NoteCodeSnippetEditorComponent,
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(NoteCodeSnippetEditorComponent);
        component = fixture.componentInstance;
    });

    describe('editor configuration', () => {
    });
});
