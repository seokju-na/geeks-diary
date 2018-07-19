import { FocusableOption } from '@angular/cdk/a11y';
import { ENTER, SPACE } from '@angular/cdk/keycodes';
import { DatePipe } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { dispatchFakeEvent, dispatchKeyboardEvent } from '../../../../test/helpers/dispatch-event';
import { expectDebugElement } from '../../../../test/helpers/expect-debug-element';
import { NoteItemDummy } from '../dummies';
import { NoteItem } from '../shared/note-item.model';
import { noteReducerMap } from '../shared/note.reducer';
import { NoteStateWithRoot } from '../shared/note.state';
import { NoteItemComponent, NoteItemSelectionChange } from './note-item.component';


describe('browser.note.NoteItemComponent', () => {
    let component: NoteItemComponent;
    let fixture: ComponentFixture<NoteItemComponent>;

    let note: NoteItem;

    let store: Store<NoteStateWithRoot>;
    let datePipe: DatePipe;

    beforeEach(async(() => {
        TestBed
            .configureTestingModule({
                imports: [
                    StoreModule.forRoot({
                        note: combineReducers(noteReducerMap),
                    }),
                ],
                providers: [DatePipe],
                declarations: [NoteItemComponent],
            })
            .compileComponents();
    }));

    beforeEach(() => {
        note = new NoteItemDummy().create();

        store = TestBed.get(Store);
        datePipe = TestBed.get(DatePipe);

        spyOn(store, 'dispatch').and.callThrough();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(NoteItemComponent);
        component = fixture.componentInstance;
        component.note = note;
        fixture.detectChanges();
    });

    it('should render title well.', () => {
        const titleEl = fixture.debugElement.query(
            By.css('.NoteItem__title'),
        );

        expectDebugElement(titleEl).toContainText(note.title);
    });

    it('should render created datetime well.', () => {
        const createdAt = datePipe.transform(
            new Date(note.createdDatetime),
            'MMM d, y HH:mm',
        );

        const createdDatetimeEl = fixture.debugElement.query(
            By.css('time.NoteItem__createdAt'),
        );

        expectDebugElement(createdDatetimeEl).toContainText(createdAt);
    });

    it('should set selected class if note has been selected.', () => {
        component.selected = true;
        fixture.detectChanges();

        expectDebugElement(fixture.debugElement)
            .toContainClasses('NoteItem--selected');
    });

    it('should \'aria-selected\' attribute value is has to be set ' +
        'to true is note has been selected.', () => {
        component.selected = true;
        fixture.detectChanges();

        expectDebugElement(fixture.debugElement)
            .toHaveAttribute('aria-selected', 'true');
    });

    it('should component implements \'FocusableOption\'.', () => {
        expect((<FocusableOption>component).focus).toBeDefined();
    });

    it('should focus host element if focus method executed.', () => {
        component.focus();
        expect(document.activeElement).toEqual(fixture.debugElement.nativeElement);
    });

    it('should set activated class if note has been activated.', () => {
        component.active = true;
        fixture.detectChanges();

        expectDebugElement(fixture.debugElement)
            .toContainClasses('NoteItem--activated');
    });

    it('should emit to \'selectionChange\' when type \'ENTER\' ' +
        'keyboard event.', () => {
        const callback = jasmine.createSpy('selection change');
        const subscription = component.selectionChange.subscribe(callback);

        dispatchKeyboardEvent(
            fixture.debugElement.nativeElement,
            'keydown',
            ENTER,
        );
        fixture.detectChanges();

        expect(callback).toHaveBeenCalledWith(
            new NoteItemSelectionChange(component, true),
        );

        subscription.unsubscribe();
    });

    it('should emit to \'selectionChange\' when type \'SPACE\' ' +
        'keyboard event.', () => {
        const callback = jasmine.createSpy('selection change');
        const subscription = component.selectionChange.subscribe(callback);

        dispatchKeyboardEvent(
            fixture.debugElement.nativeElement,
            'keydown',
            SPACE,
        );
        fixture.detectChanges();

        expect(callback).toHaveBeenCalledWith(
            new NoteItemSelectionChange(component, true),
        );

        subscription.unsubscribe();
    });

    it('should emit to \'selectionChange\' when click.', () => {
        const callback = jasmine.createSpy('selection change');
        const subscription = component.selectionChange.subscribe(callback);

        dispatchFakeEvent(
            fixture.debugElement.nativeElement,
            'click',
        );
        fixture.detectChanges();

        expect(callback).toHaveBeenCalledWith(
            new NoteItemSelectionChange(component, true),
        );

        subscription.unsubscribe();
    });

    it('should \'tabindex\' to be \'0\' if activated.', () => {
        component.active = true;
        fixture.detectChanges();

        expectDebugElement(fixture.debugElement)
            .toHaveAttribute('tabindex', '0');
    });

    it('should \'tabindex\' to be \'-1\' if deactivated.', () => {
        component.active = false;
        fixture.detectChanges();

        expectDebugElement(fixture.debugElement)
            .toHaveAttribute('tabindex', '-1');
    });
});
