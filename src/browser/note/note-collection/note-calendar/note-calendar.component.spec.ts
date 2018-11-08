import { DatePipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { expectDom, fastTestSetup } from '../../../../../test/helpers';
import { datetime, DateUnits } from '../../../../libs/datetime';
import { UiModule } from '../../../ui/ui.module';
import { noteReducerMap } from '../../note.reducer';
import { NoteStateWithRoot } from '../../note.state';
import { SelectDateFilterAction, SelectMonthFilterAction } from '../note-collection.actions';
import { NoteCalendarComponent } from './note-calendar.component';


describe('browser.note.noteCollection.NoteCalendarComponent', () => {
    let fixture: ComponentFixture<NoteCalendarComponent>;
    let component: NoteCalendarComponent;

    let store: Store<NoteStateWithRoot>;
    let datePipe: DatePipe;

    const getDecreaseMonthButtonEl = (): HTMLButtonElement =>
        fixture.debugElement.query(By.css('#decrease-month-button')).nativeElement as HTMLButtonElement;

    const getGoToTodayButtonEl = (): HTMLButtonElement =>
        fixture.debugElement.query(By.css('#go-to-today-button')).nativeElement as HTMLButtonElement;

    const getIncreaseMonthButtonEl = (): HTMLButtonElement =>
        fixture.debugElement.query(By.css('#increase-month-button')).nativeElement as HTMLButtonElement;

    function validateCalendarCell(date: Date, statusToBe: 'blank' | 'selected' | 'none'): HTMLElement {
        const datetimeAttribute = datetime.shortFormat(date);
        const cellDe = fixture.debugElement.query(
            By.css(`.NoteCalendar__cell[datetime="${datetimeAttribute}"]`),
        );

        if (!cellDe) {
            throw new Error(`Cannot find calendar cell element: ${datetimeAttribute}`);
        }

        const cellEl = cellDe.nativeElement as HTMLElement;

        switch (statusToBe) {
            case 'blank':
                expectDom(cellEl).toContainClasses('NoteCalendar__cell--blank');
                break;

            case 'selected':
                expectDom(cellEl).toContainClasses('NoteCalendar__cell--selected');
                break;

            case 'none':
                expectDom(cellEl).not.toContainClasses(
                    'NoteCalendar__cell--blank',
                    'NoteCalendar__cell--selected',
                );
        }

        return cellEl;
    }

    function checkCalendarIsRenderedWith(renderedMonth: Date): void {
        const titleDe = fixture.debugElement.query(By.css('.NoteCalendar__title'));
        expect(titleDe).not.toBeNull();
        expect((titleDe.nativeElement as HTMLElement).innerText).toContain(
            datePipe.transform(renderedMonth, 'MMM y'),
        );


        const year = renderedMonth.getFullYear();
        const month = renderedMonth.getMonth();

        const maxDays = datetime.getDaysInMonth(year, month);
        const index = datetime.getFirstDateOfMonth(year, month);

        for (let i = 0; i < maxDays; i++) {
            validateCalendarCell(index, 'none');
            datetime.add(index, DateUnits.DAY, 1);
        }
    }

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

        fixture = TestBed.createComponent(NoteCalendarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('init', () => {
        it('should render this month as default.', () => {
            checkCalendarIsRenderedWith(datetime.today());
        });
    });

    describe('navigate with store action', () => {
        it('should render calendar when selected month changed.', () => {
            const target = datetime.today();
            datetime.add(target, DateUnits.MONTH, -3);

            store.dispatch(new SelectMonthFilterAction({
                date: target,
            }));
            fixture.detectChanges();

            checkCalendarIsRenderedWith(target);
        });
    });

    describe('navigate with UI interaction', () => {
        it('should increase 1 month when click increase month button.', () => {
            // Set to previous month because we cannot navigate the future.
            (function setToPreviousMonth() {
                const previousMonth = datetime.today();
                datetime.add(previousMonth, DateUnits.MONTH, -1);
                store.dispatch(new SelectMonthFilterAction({
                    date: previousMonth,
                }));
                fixture.detectChanges();
            })();

            getIncreaseMonthButtonEl().click();
            fixture.detectChanges();

            const nextMonth = datetime.copy(new Date());
            checkCalendarIsRenderedWith(nextMonth);
        });

        it('should disable increase month button if current month is this month.', () => {
            // By default, current calendar is this month.
            expectDom(getIncreaseMonthButtonEl()).toBeDisabled();
        });

        it('should decrease 1 month when click increase month button.', () => {
            getDecreaseMonthButtonEl().click();
            fixture.detectChanges();

            const prevMonth = datetime.copy(new Date());
            datetime.add(prevMonth, DateUnits.MONTH, -1);

            checkCalendarIsRenderedWith(prevMonth);
        });

        it('should render calendar when index goes to today.', () => {
            // Set to other month.
            (function setToOtherMonth() {
                const previousMonth = datetime.today();
                datetime.add(previousMonth, DateUnits.MONTH, -5);
                store.dispatch(new SelectMonthFilterAction({
                    date: previousMonth,
                }));
                fixture.detectChanges();
            })();

            getGoToTodayButtonEl().click();
            fixture.detectChanges();

            checkCalendarIsRenderedWith(datetime.today());
        });
    });

    describe('selected date cell', () => {
        it('should select date cell if selected date is exists in store.', () => {
            const target = datetime.today();
            target.setDate(14);

            store.dispatch(new SelectDateFilterAction({ date: target }));
            fixture.detectChanges();

            validateCalendarCell(target, 'selected');
        });

        it('should select date cell when click date cell.', () => {
            const target = datetime.today();
            target.setDate(22);

            const cellEl = validateCalendarCell(target, 'none');
            cellEl.click();
            fixture.detectChanges();

            validateCalendarCell(target, 'selected');
        });

        it('should deselect date cell when click date cell if date cell has been already selected.', () => {
            const target = datetime.today();
            target.setDate(5);

            // Select date cell first.
            store.dispatch(new SelectDateFilterAction({ date: target }));
            fixture.detectChanges();

            const cellEl = validateCalendarCell(target, 'selected');
            cellEl.click();
            fixture.detectChanges();

            validateCalendarCell(target, 'none');
        });
    });

    describe('selected date description', () => {
    });
});
