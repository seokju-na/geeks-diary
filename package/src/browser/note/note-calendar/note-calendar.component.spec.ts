import { DatePipe } from '@angular/common';
import { DebugElement } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { expectDebugElement } from '../../../../test/helpers/expect-debug-element';
import { fastTestSetup } from '../../../../test/helpers/fast-test-setup';
import { datetime, DateUnits } from '../../../libs/datetime';
import { UIModule } from '../../ui/ui.module';
import { SelectMonthFilterAction } from '../shared/note-collection.actions';
import { noteReducerMap } from '../shared/note.reducer';
import { NoteStateWithRoot } from '../shared/note.state';
import { NoteCalendarComponent } from './note-calendar.component';


describe('browser.note.NoteCalendarComponent', () => {
    let component: NoteCalendarComponent;
    let fixture: ComponentFixture<NoteCalendarComponent>;

    let store: Store<NoteStateWithRoot>;
    let datePipe: DatePipe;

    const validateCalendar = (year: number, month: number, date?: number): void => {
        const selectedMonth = new Date(year, month);
        const title = fixture.debugElement.query(By.css('.NoteCalendar__title'));

        expectDebugElement(title).toContainText(datePipe.transform(selectedMonth, 'MMM y'));

        if (date) {
            const selectedDate = new Date(year, month, date);
            const dateSelection = fixture.debugElement.query(
                By.css('.NoteCalendar__selectedDate > span:nth-child(2)'));

            expectDebugElement(dateSelection).toContainText(datePipe.transform(selectedDate, 'y/MM/dd'));
        }

        const maxDays = datetime.getDaysInMonth(year, month);
        const index = datetime.getFirstDateOfMonth(year, month);

        for (let i = 0; i < maxDays; i++) {
            validateDateCell(index, 'none');
            datetime.add(index, DateUnits.DAY, 1);
        }
    };

    const validateDateCell = (
        date: Date,
        statusToBe: 'blank' | 'selected' | 'none',
    ): DebugElement => {

        const datetimeAttribute = datetime.shortFormat(date);
        const cell = fixture.debugElement.query(
            By.css(`.NoteCalendar__cell[datetime="${datetimeAttribute}"]`));

        if (!cell) {
            throw new Error(`Cannot find calendar cell element: ${datetimeAttribute}`);
        }

        switch (statusToBe) {
            case 'blank':
                expectDebugElement(cell)
                    .toContainClasses('NoteCalendar__cell--blank');
                break;

            case 'selected':
                expectDebugElement(cell)
                    .toContainClasses('NoteCalendar__cell--selected');
                break;

            case 'none':
                expectDebugElement(cell)
                    .not
                    .toContainClasses(
                        'NoteCalendar__cell--blank',
                        'NoteCalendar__cell--selected',
                    );
        }

        return cell;
    };

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                imports: [
                    UIModule,
                    StoreModule.forRoot({
                        note: combineReducers(noteReducerMap),
                    }),
                ],
                providers: [DatePipe],
                declarations: [
                    NoteCalendarComponent,
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        store = TestBed.get(Store);
        datePipe = TestBed.get(DatePipe);

        spyOn(store, 'dispatch').and.callThrough();
    });

    beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(NoteCalendarComponent);
        component = fixture.componentInstance;
        flush();
        fixture.detectChanges();
    }));

    it('should render this month as default.', () => {
        const today = datetime.today();
        validateCalendar(today.getFullYear(), today.getMonth());
    });

    it('should render calendar when selected month changed.', () => {
        const target = datetime.today();
        datetime.add(target, DateUnits.MONTH, -3);

        store.dispatch(new SelectMonthFilterAction({
            date: target,
        }));
        fixture.detectChanges();

        validateCalendar(target.getFullYear(), target.getMonth());
    });

    it('should render calendar when month increases.', fakeAsync(() => {
        // Set to previous month.
        const previousMonth = datetime.today();
        datetime.add(previousMonth, DateUnits.MONTH, -1);
        store.dispatch(new SelectMonthFilterAction({
            date: previousMonth,
        }));
        flush();
        fixture.detectChanges();

        const nextMonth = datetime.copy(previousMonth);
        datetime.add(nextMonth, DateUnits.MONTH, 1);

        const increaseButton = fixture.debugElement.query(
            By.css('button#increase-month-button'),
        );
        increaseButton.nativeElement.click();
        fixture.detectChanges();

        flush();
        fixture.detectChanges();

        validateCalendar(nextMonth.getFullYear(), nextMonth.getMonth());
    }));

    it('should increase month button is disabled when current ' +
        'calendar is this month.', () => {
        // For default, current calendar is this month.
        const increaseButton = fixture.debugElement.query(
            By.css('button#increase-month-button'),
        );

        expectDebugElement(increaseButton).toBeDisabled();
    });

    it('should render calendar when month decreases.', fakeAsync(() => {
        const previousMonth = datetime.today();
        datetime.add(previousMonth, DateUnits.MONTH, -1);

        const decreaseButton = fixture.debugElement.query(
            By.css('button#decrease-month-button'),
        );
        decreaseButton.nativeElement.click();
        fixture.detectChanges();

        flush();
        fixture.detectChanges();

        validateCalendar(previousMonth.getFullYear(), previousMonth.getMonth());
    }));

    it('should render calendar when index goes to today.', fakeAsync(() => {
        // Go to previous month.
        const previousMonth = datetime.today();
        datetime.add(previousMonth, DateUnits.MONTH, -1);

        const decreaseButton = fixture.debugElement.query(
            By.css('button#decrease-month-button'),
        );
        decreaseButton.nativeElement.click();
        fixture.detectChanges();

        const goToTodayButton = fixture.debugElement.query(
            By.css('button#go-to-today-button'),
        );

        goToTodayButton.nativeElement.click();
        fixture.detectChanges();

        flush();
        fixture.detectChanges();

        const today = datetime.today();

        validateCalendar(today.getFullYear(), today.getMonth());
    }));
});
