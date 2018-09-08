import { DOWN_ARROW, ENTER, SPACE, UP_ARROW } from '@angular/cdk/keycodes';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { combineReducers, StoreModule } from '@ngrx/store';
import { Subject } from 'rxjs';
import { dispatchKeyboardEvent } from '../../../../test/helpers/dispatch-event';
import { createDummies } from '../../../../test/helpers/dummies';
import { fastTestSetup } from '../../../../test/helpers/fast-test-setup';
import { UIModule } from '../../ui/ui.module';
import { NoteItemDummy } from '../dummies';
import { NoteItemComponent } from '../note-item/note-item.component';
import { NoteCollectionService } from '../shared/note-collection.service';
import { NoteItem } from '../shared/note-item.model';
import { noteReducerMap } from '../shared/note.reducer';
import { NoteListComponent } from './note-list.component';


describe('browser.note.NoteListComponent', () => {
    let component: NoteListComponent;
    let fixture: ComponentFixture<NoteListComponent>;

    let collection: NoteCollectionService;
    let notesStream: Subject<NoteItem[]>;
    let selectedNoteStream: Subject<NoteItem | null>;

    type TestNoteState = 'activated' | 'deactivated' | 'selected' | 'deselected' | 'focused' | 'notFocused';

    const validateNote = (
        index: number,
        states: TestNoteState[],
    ): void => {

        const target = fixture.debugElement.queryAll(
            By.directive(NoteItemComponent),
        )[index];

        if (!target) {
            throw new Error(`Cannot find note item at index: ${index}`);
        }

        const noteEl = target.componentInstance as NoteItemComponent;
        const elem = target.nativeElement as HTMLElement;

        const checkState = (state: TestNoteState) => {
            switch (state) {
                case 'activated':
                    expect(component._focusKeyManager.activeItem).toEqual(noteEl);
                    expect(component._focusKeyManager.activeItemIndex).toEqual(index);
                    break;

                case 'deactivated':
                    expect(component._focusKeyManager.activeItem).not.toEqual(noteEl);
                    expect(component._focusKeyManager.activeItemIndex).not.toEqual(index);
                    break;

                case 'selected':
                    expect(noteEl.selected).toBe(true);
                    break;

                case 'deselected':
                    expect(noteEl.selected).toBe(false);
                    break;

                case 'focused':
                    expect(document.activeElement).toEqual(elem);
                    break;

                case 'notFocused':
                    expect(document.activeElement).not.toEqual(elem);
                    break;
            }
        };

        states.forEach(checkState);
    };

    const getNote = (index: number): NoteItemComponent => {
        const target = fixture.debugElement.queryAll(
            By.directive(NoteItemComponent),
        )[index];

        if (!target) {
            throw new Error(`Cannot find note item at index: ${index}`);
        }

        return target.componentInstance;
    };

    const activeNote = (index: number) => {
        const target = getNote(index);
        component._focusKeyManager.updateActiveItem(target);
        fixture.detectChanges();
    };

    fastTestSetup();

    beforeAll(async () => {
        notesStream = new Subject<NoteItem[]>();
        selectedNoteStream = new Subject<NoteItem | null>();

        collection = jasmine.createSpyObj('collection', [
            'getFilteredAndSortedNoteList',
            'getSelectedNote',
            'toggleNoteSelection',
        ]);

        (<jasmine.Spy>collection.getFilteredAndSortedNoteList)
            .and.callFake(() => notesStream.asObservable());

        (<jasmine.Spy>collection.getSelectedNote)
            .and.callFake(() => selectedNoteStream.asObservable());

        await TestBed
            .configureTestingModule({
                imports: [
                    StoreModule.forRoot({
                        note: combineReducers(noteReducerMap),
                    }),
                    UIModule,
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
    });

    let notes: NoteItem[];

    beforeEach(fakeAsync(() => {
        notes = createDummies(new NoteItemDummy(), 10);
        notesStream.next(notes);
        flush();
        fixture.detectChanges();
    }));

    it('should show filtered and sorted note items.', fakeAsync(() => {
        const noteElList = fixture.debugElement.queryAll(By.directive(NoteItemComponent));

        noteElList.forEach((noteEl, index) => {
            expect((<NoteItemComponent>noteEl.componentInstance).note).toEqual(notes[index]);
        });
    }));

    it('should active and select note but not focus when selected note ' +
        'changed by store.', fakeAsync(() => {
        validateNote(3, ['deactivated', 'deselected', 'notFocused']);

        // Set selected note.
        selectedNoteStream.next(notes[3]);
        flush();
        fixture.detectChanges();

        validateNote(3, ['activated', 'selected', 'notFocused']);
    }));

    it('should focus, active and toggle selection the note when user ' +
        'clicks target note.', () => {
        const target = fixture.debugElement.queryAll(
            By.directive(NoteItemComponent),
        )[7];

        target.nativeElement.click();
        fixture.detectChanges();

        expect(collection.toggleNoteSelection).toHaveBeenCalledWith(notes[7]);
        validateNote(7, ['activated', 'focused']);
    });

    it('should focus and toggle selection the active note when user ' +
        'type \'ENTER\' key.', () => {

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
        validateNote(5, ['activated', 'focused']);
    });

    it('should focus and toggle selection the active note when user ' +
        'type \'SPACE\' key.', () => {

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
        validateNote(5, ['activated', 'focused']);
    });

    it('should focus first note item when user type \'DOWN_ARROW\' key ' +
        'if active item is not exists.', () => {
        // Dispatch 'DOWN_ARROW' key event.
        dispatchKeyboardEvent(
            fixture.debugElement.nativeElement,
            'keydown',
            DOWN_ARROW,
        );
        fixture.detectChanges();

        validateNote(0, ['activated', 'focused', 'deselected']);
    });

    it('should move activation and focus to next note when user type ' +
        '\'DOWN_ARROW\' key.', () => {
        // Active target item.
        activeNote(3);

        // Dispatch 'DOWN_ARROW' key event.
        dispatchKeyboardEvent(
            fixture.debugElement.nativeElement,
            'keydown',
            DOWN_ARROW,
        );
        fixture.detectChanges();

        validateNote(4, ['activated', 'focused']);
    });

    it('should move activation and focus to previous note when user type ' +
        '\'UP_ARROW\' key.', () => {
        // Active target item.
        activeNote(3);

        // Dispatch 'DOWN_ARROW' key event.
        dispatchKeyboardEvent(
            fixture.debugElement.nativeElement,
            'keydown',
            UP_ARROW,
        );
        fixture.detectChanges();

        validateNote(2, ['activated', 'focused']);
    });

    it('should show empty state if notes are empty.', fakeAsync(() => {
        notesStream.next([]);
        flush();
        fixture.detectChanges();

        const emptyState = fixture.debugElement.query(
            By.css('.NoteList__emptyState'),
        );

        expect(emptyState).not.toBeNull();
    }));
});
