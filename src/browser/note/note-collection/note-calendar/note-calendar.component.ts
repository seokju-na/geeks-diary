import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, share, tap } from 'rxjs/operators';
import { datetime, DateUnits } from '../../../../libs/datetime';
import { CalendarTable, CalendarTableCell } from '../../../ui/datetime';
import { NoteStateWithRoot } from '../../note.state';
import { SelectDateFilterAction, SelectMonthFilterAction } from '../note-collection.actions';


@Component({
    selector: 'gd-note-calendar',
    templateUrl: './note-calendar.component.html',
    styleUrls: ['./note-calendar.component.scss'],
})
export class NoteCalendarComponent implements OnInit {
    readonly calendar = new CalendarTable();

    readonly currentDate: Observable<Date> = this.store.pipe(
        select(state => state.note.collection.selectedMonth),
        map(selection => new Date(selection.year, selection.month)),
        tap((indexDate) => {
            this.currentDateCache = datetime.copy(indexDate);
            this.calendar.render(indexDate.getFullYear(), indexDate.getMonth());
        }),
    );

    readonly selectedDate: Observable<Date | null> = this.store.pipe(
        select(state => state.note.collection.selectedDate),
        map(selection => selection
            ? new Date(selection.year, selection.month, selection.date)
            : null,
        ),
        tap(value => this.selectedDateCache = value),
        share(),
    );

    private currentDateCache: Date | null = null;
    private selectedDateCache: Date | null = null;

    constructor(private store: Store<NoteStateWithRoot>) {
    }

    get canNavigateNextMonth(): boolean {
        if (this.currentDateCache) {
            return !datetime.isAfterOrSame(this.currentDateCache, datetime.today(), DateUnits.MONTH);
        } else {
            return false;
        }
    }

    ngOnInit(): void {
        this.calendar.renderThisMonth();
    }

    decreaseMonth(): void {
        if (!this.currentDateCache) {
            return;
        }

        const previousMonth = datetime.copy(this.currentDateCache);
        datetime.add(previousMonth, DateUnits.MONTH, -1);

        this.store.dispatch(new SelectMonthFilterAction({ date: previousMonth }));
    }

    increaseMonth(): void {
        if (!this.currentDateCache) {
            return;
        }

        const nextMonth = datetime.copy(this.currentDateCache);
        datetime.add(nextMonth, DateUnits.MONTH, 1);

        this.store.dispatch(new SelectMonthFilterAction({ date: nextMonth }));
    }

    goToToday(): void {
        this.store.dispatch(new SelectMonthFilterAction({ date: datetime.today() }));
    }

    isCellSelected(cell: CalendarTableCell): boolean {
        if (cell.isBlank() || !this.selectedDateCache) {
            return false;
        }

        return datetime.isSameDay(cell.date, this.selectedDateCache);
    }

    selectDateCell(cell: CalendarTableCell): void {
        if (this.isCellSelected(cell)) {
            this.store.dispatch(new SelectMonthFilterAction({ date: this.currentDateCache }));
        } else {
            this.store.dispatch(new SelectDateFilterAction({ date: cell.date }));
        }
    }
}
