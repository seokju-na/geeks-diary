import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, share, tap } from 'rxjs/operators';
import { datetime } from '../../../libs/datetime';
import {
    CALENDAR_TABLE,
    CalendarTable,
    CalendarTableCell,
    CalendarTableFactory,
} from '../../ui/calendar/calendar-table';
import { NoteStateWithRoot } from '../shared/note.state';


@Component({
    selector: 'gd-note-calendar',
    templateUrl: './note-calendar.component.html',
    styleUrls: ['./note-calendar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteCalendarComponent implements OnInit {
    readonly calendar: CalendarTable;

    readonly indexDate: Observable<Date> = this.store.pipe(
        select(state => state.note.collection.selectedMonth),
        map(selection => new Date(selection.year, selection.month)),
        tap(indexDate => this.renderTable(indexDate)),
        share(),
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
