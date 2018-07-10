import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteEditorComponent } from './note-editor.component';


describe('NoteEditorComponent', () => {
    let component: NoteEditorComponent;
    let fixture: ComponentFixture<NoteEditorComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
                declarations: [NoteEditorComponent],
            })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NoteEditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
