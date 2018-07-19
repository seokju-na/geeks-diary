import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, share, tap } from 'rxjs/operators';
import { datetime, DateUnits } from '../../../libs/datetime';
import {
    CALENDAR_TABLE,
    CalendarTable,
    CalendarTableCell,
    CalendarTableFactory,
} from '../../ui/calendar/calendar-table';
import { SelectDateFilterAction, SelectMonthFilterAction } from '../shared/note-collection.actions';
import { NoteStateWithRoot } from '../shared/note.state';


/**
 * IDEA: DatCell을 item으로 FocusKeyManager 구현
 */
@Component({
    selector: 'gd-note-calendar',
    templateUrl: './note-calendar.component.html',
    styleUrls: ['./note-calendar.component.scss'],
})
export class NoteCalendarComponent implements OnInit {
    readonly calendar: CalendarTable;

    readonly indexDate: Observable<Date> = this.store.pipe(
        select(state => state.note.collection.selectedMonth),
        map(selection => new Date(selection.year, selection.month)),
        tap((indexDate) => {
            this._indexDateCache = datetime.copy(indexDate);
            this.renderTable(indexDate);
        }),
    );

    readonly disableIncreasingMonth: Observable<boolean> = this.store.pipe(
        select(state => state.note.collection.selectedMonth),
        map(selection => new Date(selection.year, selection.month)),
        map(index =>
            datetime.isAfterOrSame(index, datetime.today(), DateUnits.MONTH),
        ),
    );

    readonly selectedDate: Observable<Date | null> = this.store.pipe(
        select(state => state.note.collection.selectedDate),
        map(selection => selection
            ? new Date(selection.year, selection.month, selection.date)
            : null,
        ),
        tap(value => this._selectedDateCache = value),
        share(),
    );

    _indexDateCache: Date | null = null;
    _selectedDateCache: Date | null = null;

    constructor(
        @Inject(CALENDAR_TABLE) calendarTableFactory: CalendarTableFactory,
        private store: Store<NoteStateWithRoot>,
        private changeDetector: ChangeDetectorRef,
    ) {

        this.calendar = calendarTableFactory();
    }

    ngOnInit(): void {
    }

    decreaseMonth(): void {
        if (!this._indexDateCache) {
            return;
        }

        const previousMonth = datetime.copy(this._indexDateCache);
        datetime.add(previousMonth, DateUnits.MONTH, -1);

        this.store.dispatch(new SelectMonthFilterAction({ date: previousMonth }));
    }

    increaseMonth(): void {
        if (!this._indexDateCache) {
            return;
        }

        const nextMonth = datetime.copy(this._indexDateCache);
        datetime.add(nextMonth, DateUnits.MONTH, 1);

        this.store.dispatch(new SelectMonthFilterAction({ date: nextMonth }));
    }

    goToToday(): void {
        this.store.dispatch(new SelectMonthFilterAction({
            date: datetime.today(),
        }));
    }

    selectDateCell(cell: CalendarTableCell): void {
        if (this._selectedDateCache
            && datetime.isSameDay(this._selectedDateCache, cell.date)) {

            this.store.dispatch(new SelectMonthFilterAction({
                date: this._indexDateCache,
            }));
        } else {
            this.store.dispatch(new SelectDateFilterAction({
                date: cell.date,
            }));
        }
    }

    isCellSelected(cell: CalendarTableCell): boolean {
        if (cell.isBlank() || !this._selectedDateCache) {
            return false;
        }

        return datetime.isSameDay(cell.date, this._selectedDateCache);
    }

    private renderTable(indexDate: Date): void {
        const year = indexDate.getFullYear();
        const month = indexDate.getMonth();

        this.calendar.render(year, month);
        this.changeDetector.detectChanges();
    }
}
