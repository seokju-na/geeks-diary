import { DatePipe } from '@angular/common';
import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { expectDebugElement } from '../../../../test/helpers/expect-debug-element';
import { datetime, DateUnits } from '../../../libs/datetime';
import { UIModule } from '../../ui/ui.module';
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

            expectDebugElement(dateSelection).toContainText(datePipe.transform(selectedDate, 'y/MM/DD'));
        } else {
            const noDateSelection = fixture.debugElement.query(
                By.css('.NoteCalendar__selectedDate > span:nth-child(3)'));

            expect(noDateSelection).not.toBeNull();
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

    beforeEach(async(() => {
        TestBed
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
    }));

    beforeEach(() => {
        store = TestBed.get(Store);
        datePipe = TestBed.get(DatePipe);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(NoteCalendarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('date navigation', () => {
        it('should render calendar when after selected month changed from store.', () => {
            const previousMonth = datetime.today();
            datetime.add(previousMonth, DateUnits.MONTH, -1);

            // store.dispatch();
            fixture.detectChanges();
        });

        it('should render calendar when month increases.', () => {
        });

        it('should render calendar when month decreases.', () => {
        });

        it('should render calendar when index goes to today.', () => {
        });
    });

    describe('date selection', () => {
    });

    describe('note contribution', () => {
    });
});
