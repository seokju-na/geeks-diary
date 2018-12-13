import { DOWN_ARROW, ENTER, SPACE, UP_ARROW } from '@angular/cdk/keycodes';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { combineReducers, StoreModule } from '@ngrx/store';
import { Subject } from 'rxjs';
import { NoteItem, NoteItemComponent } from '..';
import { createDummies, dispatchKeyboardEvent, expectDom, fastTestSetup } from '../../../../../test/helpers';
import { UiModule } from '../../../ui/ui.module';
import { noteReducerMap } from '../../note.reducer';
import { NoteItemDummy } from '../dummies';
import { NoteCollectionService } from '../note-collection.service';
import { NoteListComponent } from './note-list.component';


describe('browser.note.noteCollection.NoteListComponent', () => {
    let fixture: ComponentFixture<NoteListComponent>;
    let component: NoteListComponent;

    let collection: NoteCollectionService;
    let notes: NoteItem[];
    let notesStream: Subject<NoteItem[]>;
    let selectedNoteStream: Subject<NoteItem | null>;
    const noteDummy = new NoteItemDummy();

    const getNote = (index: number): NoteItemComponent => {
        const target = fixture.debugElement.queryAll(By.directive(NoteItemComponent))[index];

        if (!target) {
            throw new Error(`Cannot find note item at index: ${index}`);
        }

        return target.componentInstance as NoteItemComponent;
    };

    function activeNote(index: number): void {
        const target = getNote(index);
        component._focusKeyManager.updateActiveItem(target);
        fixture.detectChanges();
    }

    type TestNoteStatus = 'activated' | 'deactivated' | 'selected' | 'deselected' | 'focused' | 'notFocused';

    /** Validate note status. */
    function validateNoteStatus(index: number, statues: TestNoteStatus[]): void {
        const target = fixture.debugElement.queryAll(By.directive(NoteItemComponent))[index];

        if (!target) {
            throw new Error(`Cannot find note item at index: ${index}`);
        }

        const noteComp = target.componentInstance as NoteItemComponent;
        const noteEl = noteComp._elementRef.nativeElement;

        statues.forEach((state: TestNoteStatus) => {
            switch (state) {
                case 'activated':
                    expect(component._focusKeyManager.activeItem).toEqual(noteComp);
                    expect(component._focusKeyManager.activeItemIndex).toEqual(index);
                    break;

                case 'deactivated':
                    expect(component._focusKeyManager.activeItem).not.toEqual(noteComp);
                    expect(component._focusKeyManager.activeItemIndex).not.toEqual(index);
                    break;

                case 'selected':
                    expect(noteComp.selected).toBe(true);
                    break;

                case 'deselected':
                    expect(noteComp.selected).toBe(false);
                    break;

                case 'focused':
                    expectDom(noteEl).toBeFocused();
                    break;

                case 'notFocused':
                    expectDom(noteEl).not.toBeFocused();
                    break;
            }
        });
    }

    fastTestSetup();

    beforeAll(async () => {
        notesStream = new Subject<NoteItem[]>();
        selectedNoteStream = new Subject<NoteItem | null>();

        collection = jasmine.createSpyObj('collection', [
            'getFilteredAndSortedNoteList',
            'getSelectedNote',
            'toggleNoteSelection',
            'getNoteVcsFileChangeStatus',
        ]);

        (<jasmine.Spy>collection.getFilteredAndSortedNoteList)
            .and.callFake(() => notesStream.asObservable());

        (<jasmine.Spy>collection.getSelectedNote)
            .and.callFake(() => selectedNoteStream.asObservable());

        (<jasmine.Spy>collection.getNoteVcsFileChangeStatus)
            .and.returnValue(false);

        await TestBed
            .configureTestingModule({
                imports: [
                    UiModule,
                    StoreModule.forRoot({
                        note: combineReducers(noteReducerMap),
                    }),
                ],
                providers: [
                    { provide: NoteCollectionService, useValue: collection },
                ],
                declarations: [
                    NoteItemComponent,
                    NoteListComponent,
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(NoteListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        notes = createDummies(noteDummy, 10);
        notesStream.next(notes);
        fixture.detectChanges();
    });

    it('should show filtered and sorted note items.', () => {
        const noteElList = fixture.debugElement.queryAll(By.directive(NoteItemComponent));

        noteElList.forEach((noteEl, index) => {
            expect((noteEl.componentInstance as NoteItemComponent).note).toEqual(notes[index]);
        });
    });

    it('should select note but not focus when selected note changed by store.', () => {
        validateNoteStatus(3, ['deactivated', 'deselected', 'notFocused']);

        // Set selected note.
        selectedNoteStream.next(notes[3]);
        fixture.detectChanges();

        validateNoteStatus(3, ['selected', 'notFocused']);
    });

    it('should focus, active and toggle selection the note when user clicks target note.', () => {
        const target = fixture.debugElement.queryAll(By.directive(NoteItemComponent))[7];

        target.nativeElement.click();
        fixture.detectChanges();

        expect(collection.toggleNoteSelection).toHaveBeenCalledWith(notes[7]);
        validateNoteStatus(7, ['activated', 'focused']);
    });

    it('should focus and toggle selection the active note when user type \'ENTER\' key.', () => {
        // Active target the note.
        activeNote(5);

        // Dispatch 'ENTER' key event.
        dispatchKeyboardEvent(
            getNote(5)._elementRef.nativeElement,
            'keydown',
            ENTER,
        );
        fixture.detectChanges();

        expect(collection.toggleNoteSelection).toHaveBeenCalledWith(notes[5]);
        validateNoteStatus(5, ['activated', 'focused']);
    });

    it('should focus and toggle selection the active note when user type \'SPACE\' key.', () => {
        // Active target the note.
        activeNote(5);

        // Dispatch 'ENTER' key event.
        dispatchKeyboardEvent(
            getNote(5)._elementRef.nativeElement,
            'keydown',
            SPACE,
        );
        fixture.detectChanges();

        expect(collection.toggleNoteSelection).toHaveBeenCalledWith(notes[5]);
        validateNoteStatus(5, ['activated', 'focused']);
    });

    it('should focus first note item when user type \'DOWN_ARROW\' key if active item is not exists.', () => {
        // Dispatch 'DOWN_ARROW' key event.
        dispatchKeyboardEvent(
            fixture.debugElement.nativeElement,
            'keydown',
            DOWN_ARROW,
        );
        fixture.detectChanges();

        validateNoteStatus(0, ['activated', 'focused', 'deselected']);
    });

    it('should move activation and focus to next note when user type \'DOWN_ARROW\' key.', () => {
        // Active target item.
        activeNote(3);

        // Dispatch 'DOWN_ARROW' key event.
        dispatchKeyboardEvent(
            fixture.debugElement.nativeElement,
            'keydown',
            DOWN_ARROW,
        );
        fixture.detectChanges();

        validateNoteStatus(4, ['activated', 'focused']);
    });

    it('should move activation and focus to previous note when user type \'UP_ARROW\' key.', () => {
        // Active target item.
        activeNote(3);

        // Dispatch 'DOWN_ARROW' key event.
        dispatchKeyboardEvent(
            fixture.debugElement.nativeElement,
            'keydown',
            UP_ARROW,
        );
        fixture.detectChanges();

        validateNoteStatus(2, ['activated', 'focused']);
    });

    it('should show empty state if notes are empty.', () => {
        notesStream.next([]);
        fixture.detectChanges();

        const emptyState = fixture.debugElement.query(By.css('.NoteList__emptyState'));
        expect(emptyState).not.toBeNull();
    });
});
