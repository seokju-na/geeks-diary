import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { createDummyList } from '../../../../testing/dummy';
import { MonacoService } from '../../../core/monaco.service';
import { SharedModule } from '../../../shared/shared.module';
import { StackDummyFactory } from '../../../stack/dummies';
import { StackViewer } from '../../../stack/stack-viewer';
import { UpdateStacksAction } from '../../actions';
import { noteReducerMap, NoteStateWithRoot } from '../../reducers';
import { NoteEditorToolbarComponent } from './toolbar.component';


describe('app.note.editor.toolbar.NoteEditorToolbarComponent', () => {
    let fixture: ComponentFixture<NoteEditorToolbarComponent>;
    let component: NoteEditorToolbarComponent;

    let store: Store<NoteStateWithRoot>;

    beforeEach(async(() => {
        TestBed
            .configureTestingModule({
                imports: [
                    SharedModule,
                    StoreModule.forRoot({
                        note: combineReducers(noteReducerMap),
                    }),
                ],
                providers: [
                    MonacoService,
                    StackViewer,
                ],
                declarations: [
                    NoteEditorToolbarComponent,
                ],
                schemas: [NO_ERRORS_SCHEMA],
            })
            .compileComponents();
    }));

    beforeEach(inject(
        [Store],
        (s: Store<NoteStateWithRoot>) => {
            store = s;
        },
    ));

    beforeEach(() => {
        spyOn(store, 'dispatch').and.callThrough();

        fixture = TestBed.createComponent(NoteEditorToolbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should dispatch \'UPDATE_STACKS\' action on update stacks.', () => {
        const stacks = createDummyList(new StackDummyFactory(), 5);
        const expected = new UpdateStacksAction({
            stacks: stacks.map(stack => stack.name),
        });

        component.updateStacks(stacks);
        fixture.detectChanges();

        expect(store.dispatch).toHaveBeenCalledWith(expected);
    });
});
