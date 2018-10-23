import { ComponentFixture, TestBed } from '@angular/core/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { expectDom, fastTestSetup } from '../../../../../test/helpers';
import { UiModule } from '../../../ui/ui.module';
import { DeselectNoteAction, SelectNoteAction } from '../../note-collection';
import { NoteItemDummy } from '../../note-collection/dummies';
import { noteReducerMap } from '../../note.reducer';
import { NoteStateWithRoot } from '../../note.state';
import { NoteHeaderComponent } from './note-header.component';


describe('browser.note.noteEditor.NoteHeaderComponent', () => {
    let fixture: ComponentFixture<NoteHeaderComponent>;
    let component: NoteHeaderComponent;

    let store: Store<NoteStateWithRoot>;

    const getSelectedNoteTitleEl = (): HTMLElement =>
        (fixture.debugElement.nativeElement as HTMLElement).querySelector('#selected-note-title');

    const getToolbarEl = (): HTMLElement =>
        (fixture.debugElement.nativeElement as HTMLElement).querySelector('.NoteHeader__toolbar');

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                imports: [
                    UiModule,
                    StoreModule.forRoot({
                        note: combineReducers(noteReducerMap),
                    }),
                ],
                declarations: [
                    NoteHeaderComponent,
                ],
                providers: [],
            })
            .compileComponents();
    });

    beforeEach(() => {
        store = TestBed.get(Store);

        fixture = TestBed.createComponent(NoteHeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('note title', () => {
        it('should note title not exists if current selected note is not exists.', () => {
            store.dispatch(new DeselectNoteAction());
            fixture.detectChanges();

            expect(getSelectedNoteTitleEl()).toBeNull();
        });

        it('should note title exists if current selected note is exists.', () => {
            const note = new NoteItemDummy().create();

            store.dispatch(new SelectNoteAction({ note }));
            fixture.detectChanges();

            expectDom(getSelectedNoteTitleEl()).toContainText(note.title);
        });

        it('should change note title to changed selected note\'s title.', () => {
            const noteDummy = new NoteItemDummy();
            const beforeNote = noteDummy.create();
            const afterNote = noteDummy.create();

            store.dispatch(new SelectNoteAction({ note: beforeNote }));
            fixture.detectChanges();

            let titleEl = getSelectedNoteTitleEl();

            expectDom(titleEl).toContainText(beforeNote.title);
            expectDom(titleEl).not.toContainText(afterNote.title);

            store.dispatch(new SelectNoteAction({ note: afterNote }));
            fixture.detectChanges();

            titleEl = getSelectedNoteTitleEl();

            expectDom(titleEl).not.toContainText(beforeNote.title);
            expectDom(titleEl).toContainText(afterNote.title);
        });
    });

    describe('toolbar', () => {
        it('should not exists if current selected note is not exists.', () => {
            store.dispatch(new DeselectNoteAction());
            fixture.detectChanges();

            expect(getToolbarEl()).toBeNull();
        });

        it('should exists if current selected note is exists.', () => {
            store.dispatch(new SelectNoteAction({ note: new NoteItemDummy().create() }));
            fixture.detectChanges();

            expect(getToolbarEl()).not.toBeNull();
        });
    });
});
