import { Component, OnInit, OnChanges, Inject, Input, SimpleChanges } from '@angular/core';
import { CalendarTable } from '../../ui/calendar/calendar-table';


@Component({
    selector: 'app-diary-calendar',
    templateUrl: './diary-calendar.component.html',
    styleUrls: ['./diary-calendar.component.less']
})
export class DiaryCalendarComponent implements OnInit, OnChanges {
    @Input() year: number;
    @Input() month: number;
    calendarTableFactory: (year: number, month: number) => CalendarTable;
    calendarTable: CalendarTable;

    private makeCalendarTable() {
        this.calendarTable = this.calendarTableFactory(this.year, this.month);
    }

    constructor(@Inject(CalendarTable) calendarTableFactory: any) {
        this.calendarTableFactory = calendarTableFactory;
    }

    ngOnInit() {
    }


    ngOnChanges(changesObj: SimpleChanges) {
        if (Number.isInteger(this.year) && Number.isInteger(this.month)) {
            this.makeCalendarTable();
        }
    }
}
