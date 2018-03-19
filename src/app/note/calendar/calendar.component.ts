import { Component, EventEmitter, Inject, Input, OnChanges, Output } from '@angular/core';
import { datetime, DateUnits } from '../../../common/datetime';
import {
    CALENDAR_TABLE,
    CalendarTable,
    CalendarTableFactory,
} from '../../shared/calendar/calendar-table';


export class NoteCalendarDateChange {
    constructor(public distDate: Date) {}
}


@Component({
    selector: 'gd-note-calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.less'],
})
export class NoteCalendarComponent implements OnChanges {
    @Input() indexDate: Date;
    @Output() changeIndexDate = new EventEmitter<NoteCalendarDateChange>();
    calendar: CalendarTable;

    constructor(@Inject(CALENDAR_TABLE) calendarFactory: CalendarTableFactory) {
        this.calendar = calendarFactory();
    }

    ngOnChanges(): void {
        if (this.indexDate) {
            this.renderTable();
        }
    }

    decreaseMonth(): void {
        const distDate = datetime.copy(this.indexDate);
        datetime.add(distDate, DateUnits.MONTH, -1);

        this.changeIndexDate.emit(new NoteCalendarDateChange(distDate));
    }

    increaseMonth(): void {
        const distDate = datetime.copy(this.indexDate);
        datetime.add(distDate, DateUnits.MONTH, 1);

        this.changeIndexDate.emit(new NoteCalendarDateChange(distDate));
    }

    private renderTable(): void {
        this.calendar.render(this.indexDate.getFullYear(), this.indexDate.getMonth());
    }
}
