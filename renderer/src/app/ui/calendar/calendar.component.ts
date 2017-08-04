import { Component, OnInit, Inject } from '@angular/core';
import { CalendarTable } from './calendar-table';


@Component({
    selector: 'app-calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.less']
})
export class CalendarComponent implements OnInit {
    calendarTableFactory: (year: number, month: number) => CalendarTable;
    calendarTable: CalendarTable;

    constructor(@Inject(CalendarTable) calendarTableFactory: any) {
        this.calendarTableFactory = calendarTableFactory;
    }

    ngOnInit() {
        this.calendarTable = this.calendarTableFactory(2017, 7);
    }

}
