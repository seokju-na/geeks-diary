import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { createDummies, expectDom, fastTestSetup, sample, sampleWithout } from '../../../../test/helpers';
import { SharedModule } from '../../shared';
import { UiModule } from '../../ui/ui.module';
import { LoadNoteCollectionCompleteAction, NoteItem, SelectNoteAction } from '../note-collection';
import { NoteItemDummy } from '../note-collection/dummies';
import { LoadNoteContentCompleteAction, NoteContent } from '../note-editor';
import { NoteContentDummy } from '../note-editor/dummies';
import { NoteSharedModule } from '../note-shared';
import { noteReducerMap } from '../note.reducer';
import { NoteStateWithRoot } from '../note.state';
import { NotePreviewComponent } from './note-preview.component';


describe('browser.note.notePreview.NotePreviewComponent', () => {
    let fixture: ComponentFixture<NotePreviewComponent>;
    let component: NotePreviewComponent;

    let store: Store<NoteStateWithRoot>;

    const noteDummy = new NoteItemDummy();
    const contentDummy = new NoteContentDummy();

    let notes: NoteItem[];
    let selectedNote: NoteItem;
    let content: NoteContent;

    const getNoteTitleEl = (): HTMLElement => fixture.debugElement.query(By.css(
        '.NotePreview__title > h1',
    )).nativeElement as HTMLElement;

    const getSnippetElList = (): HTMLElement[] => fixture.debugElement.queryAll(
        By.css('.NotePreview__snippet'),
    ).map(de => de.nativeElement as HTMLElement);

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                imports: [
                    UiModule,
                    SharedModule,
                    StoreModule.forRoot({
                        note: combineReducers(noteReducerMap),
                    }),
                    NoteSharedModule,
                ],
                declarations: [
                    NotePreviewComponent,
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        notes = createDummies(noteDummy, 10);
        selectedNote = sample(notes);
        content = contentDummy.create();

        store = TestBed.get(Store);

        fixture = TestBed.createComponent(NotePreviewComponent);
        component = fixture.componentInstance;

        store.dispatch(new LoadNoteCollectionCompleteAction({ notes }));
        store.dispatch(new SelectNoteAction({ note: selectedNote }));
        store.dispatch(new LoadNoteContentCompleteAction({
            note: selectedNote,
            content,
        }));
    });

    it('should display selected note title.', () => {
        fixture.detectChanges();
        expectDom(getNoteTitleEl()).toContainText(selectedNote.title);
    });

    it('should update note title if selected note changed.', () => {
        fixture.detectChanges();

        expectDom(getNoteTitleEl()).toContainText(selectedNote.title);

        selectedNote = sampleWithout(notes, [selectedNote]);
        store.dispatch(new SelectNoteAction({ note: selectedNote }));
        fixture.detectChanges();

        expectDom(getNoteTitleEl()).toContainText(selectedNote.title);
    });

    it('should add snippets as html which from note content.', () => {
        fixture.detectChanges();

        expect(getSnippetElList().length).toEqual(content.snippets.length);
    });
});
