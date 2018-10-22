import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteEditorToolbarComponent } from './note-editor-toolbar.component';


describe('browser.note.noteEditor.NoteEditorToolbarComponent', () => {
    let component: NoteEditorToolbarComponent;
    let fixture: ComponentFixture<NoteEditorToolbarComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
                declarations: [NoteEditorToolbarComponent],
            })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NoteEditorToolbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
