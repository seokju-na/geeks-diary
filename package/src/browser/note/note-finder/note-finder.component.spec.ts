import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { combineReducers, StoreModule } from '@ngrx/store';
import { UIModule } from '../../ui/ui.module';
import { noteReducerMap } from '../shared/note.reducer';

import { NoteFinderComponent } from './note-finder.component';


describe('NoteFinderComponent', () => {
    let component: NoteFinderComponent;
    let fixture: ComponentFixture<NoteFinderComponent>;

    beforeEach(async(() => {
        TestBed
            .configureTestingModule({
                imports: [
                    UIModule,
                    StoreModule.forRoot({
                        note: combineReducers(noteReducerMap),
                    }),
                ],
                declarations: [NoteFinderComponent],
                schemas: [NO_ERRORS_SCHEMA],
            })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NoteFinderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should dispatch ', () => {
        expect(component).toBeTruthy();
    });
});
