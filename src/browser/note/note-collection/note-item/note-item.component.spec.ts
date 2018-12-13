import { FocusableOption } from '@angular/cdk/a11y';
import { ENTER, SPACE } from '@angular/cdk/keycodes';
import { DatePipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { dispatchFakeEvent, dispatchKeyboardEvent, expectDom, fastTestSetup } from '../../../../../test/helpers';
import { VcsFileChangeStatusTypes } from '../../../../core/vcs';
import { UiModule } from '../../../ui/ui.module';
import { NoteItemDummy } from '../dummies';
import { NoteItem } from '../note-item.model';
import { NoteItemContextMenu } from './note-item-context-menu';
import { NoteItemComponent, NoteItemSelectionChange } from './note-item.component';


describe('browser.note.noteCollection.NoteItemComponent', () => {
    let fixture: ComponentFixture<NoteItemComponent>;
    let component: NoteItemComponent;

    let note: NoteItem;
    let datePipe: DatePipe;

    const noteDummy = new NoteItemDummy();

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                imports: [
                    UiModule,
                ],
                providers: [
                    DatePipe,
                    NoteItemContextMenu,
                ],
                declarations: [NoteItemComponent],
            })
            .compileComponents();
    });

    beforeEach(() => {
        // Dummies
        note = noteDummy.create();

        // Injectors
        datePipe = TestBed.get(DatePipe);

        // Fixture
        fixture = TestBed.createComponent(NoteItemComponent);
        component = fixture.componentInstance;
        component.note = note;
    });

    it('should render title well.', () => {
        fixture.detectChanges();

        const titleEl = fixture.debugElement.query(By.css('.NoteItem__title')).nativeElement as HTMLElement;
        expectDom(titleEl).toContainText(note.title);
    });

    it('should render \'(Untitled Note)\' if note has not title.', () => {
        component.note = {
            ...noteDummy.create(),
            title: '',
        };
        fixture.detectChanges();

        const titleEl = fixture.debugElement.query(By.css('.NoteItem__title')).nativeElement as HTMLElement;
        expectDom(titleEl).toContainText('(Untitled Note)');
    });

    it('should render created datetime well.', () => {
        fixture.detectChanges();

        const createdAt = datePipe.transform(new Date(note.createdDatetime), 'MMM d, y h:mm a');
        const createdDatetimeEl = fixture.debugElement.query(
            By.css('time.NoteItem__createdAt'),
        ).nativeElement as HTMLElement;

        expectDom(createdDatetimeEl).toContainText(createdAt);
    });

    it('should set selected class if note has been selected.', () => {
        component.selected = true;
        fixture.detectChanges();

        expectDom(component._elementRef.nativeElement).toContainClasses('NoteItem--selected');
    });

    it('should \'aria-selected\' attribute value is has to be set ' +
        'to true is note has been selected.', () => {
        component.selected = true;
        fixture.detectChanges();

        expectDom(component._elementRef.nativeElement).toHaveAttribute('aria-selected', 'true');
    });

    it('should component implements \'FocusableOption\'.', () => {
        fixture.detectChanges();
        expect((<FocusableOption>component).focus).toBeDefined();
    });

    it('should focus host element if focus method executed.', () => {
        fixture.detectChanges();

        component.focus();
        expect(document.activeElement).toEqual(component._elementRef.nativeElement);
    });

    it('should set activated class if note has been activated.', () => {
        component.active = true;
        fixture.detectChanges();

        expectDom(component._elementRef.nativeElement).toContainClasses('NoteItem--activated');
    });

    it('should emit to \'selectionChange\' when type \'ENTER\' keyboard event.', () => {
        fixture.detectChanges();

        const callback = jasmine.createSpy('selection change');
        const subscription = component.selectionChange.subscribe(callback);

        dispatchKeyboardEvent(
            component._elementRef.nativeElement,
            'keydown',
            ENTER,
        );
        fixture.detectChanges();

        expect(callback).toHaveBeenCalledWith(new NoteItemSelectionChange(component, true));
        subscription.unsubscribe();
    });

    it('should emit to \'selectionChange\' when type \'SPACE\' keyboard event.', () => {
        fixture.detectChanges();

        const callback = jasmine.createSpy('selection change');
        const subscription = component.selectionChange.subscribe(callback);

        dispatchKeyboardEvent(
            component._elementRef.nativeElement,
            'keydown',
            SPACE,
        );
        fixture.detectChanges();

        expect(callback).toHaveBeenCalledWith(new NoteItemSelectionChange(component, true));
        subscription.unsubscribe();
    });

    it('should emit to \'selectionChange\' when click.', () => {
        fixture.detectChanges();

        const callback = jasmine.createSpy('selection change');
        const subscription = component.selectionChange.subscribe(callback);

        dispatchFakeEvent(
            component._elementRef.nativeElement,
            'click',
        );
        fixture.detectChanges();

        expect(callback).toHaveBeenCalledWith(new NoteItemSelectionChange(component, true));
        subscription.unsubscribe();
    });

    it('should \'tabindex\' to be \'0\' if activated.', () => {
        component.active = true;
        fixture.detectChanges();

        expectDom(component._elementRef.nativeElement).toHaveAttribute('tabindex', '0');
    });

    it('should \'tabindex\' to be \'-1\' if deactivated.', () => {
        component.active = false;
        fixture.detectChanges();

        expectDom(component._elementRef.nativeElement).toHaveAttribute('tabindex', '-1');
    });

    it('should contain \'NoteItem--hasLabel\' class if note has label.', () => {
        component.note = {
            ...component.note,
            label: 'this_is_label',
        };
        fixture.detectChanges();

        expectDom(component._elementRef.nativeElement).toContainClasses('NoteItem--hasLabel');
    });

    it('should contain \'NoteItem--hasVcsStatus\' class if status provided.', () => {
        component.status = VcsFileChangeStatusTypes.NEW;
        fixture.detectChanges();

        expectDom(component._elementRef.nativeElement).toContainClasses('NoteItem--hasVcsStatus');
    });

    it('should status bar and icon exists if status provided.', () => {
        component.status = VcsFileChangeStatusTypes.MODIFIED;
        fixture.detectChanges();

        const elem = component._elementRef.nativeElement;

        expect(elem.querySelector('.NoteItem__statusBar')).not.toBeNull();
        expect(elem.querySelector('.NoteItem__statusIcon')).not.toBeNull();
    });
});
