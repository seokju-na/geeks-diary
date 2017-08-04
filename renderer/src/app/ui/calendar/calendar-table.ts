import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Moment } from 'moment';
import { getFirstDateOfMonth, copyDate, unifyDate } from '../../utils/date-helpers';


export class DateCell {
    date: Moment | null = null;
    isBlank = false;
    diffWithToday: number;
    displayName: string;
    time: number;

    static getDiffWithToday(source: Moment): number {
        const today = unifyDate();
        const target = unifyDate(source);

        return target.diff(today, 'days');
    }

    constructor(date?: Moment) {
        if (!date) {
            // Make blank cell when date object is not provided.
            this.date = null;
            this.isBlank = true;
            return;
        }

        this.date = copyDate(date);
        this.diffWithToday = DateCell.getDiffWithToday(this.date);
        this.displayName = this.date.format('YYYY-MM-DD');
        this.time = this.date.valueOf(); // Equivalent with 'Date.prototype.getTime()'.
    }
}

export class WeekRow {
    cells: DateCell[] = [];
    isFirst = false;
    isLast = false;

    private addBlankDateCells(count: number) {
        for (let i = 0; i < count; i++) {
            this.cells.push(new DateCell());
        }
    }

    constructor(indexDate: Moment, beforeBlankCellsCount: number = 0, afterBlankCellsCount: number = 0) {
        this.addBlankDateCells(beforeBlankCellsCount);

        for (let i = 0; i < 7 - (beforeBlankCellsCount + afterBlankCellsCount); i++) {
            this.cells.push(new DateCell(indexDate));
            indexDate.add(1, 'days');
        }

        this.addBlankDateCells(afterBlankCellsCount);
    }

    setAsFirstWeek() {
        this.isFirst = true;
    }

    setAsLastWeek() {
        this.isLast = true;
    }
}

@Injectable()
export class CalendarTable {
    rows: WeekRow[] = [];
    year: number;
    month: number;
    weeksCount: number;
    displayName: string;

    private render() {
        const firstDate = getFirstDateOfMonth(this.year, this.month);
        const dayOfFirstDate = firstDate.day();
        const maxDays = firstDate.endOf('month').date();

        const firstRowCellsCount = 7 - dayOfFirstDate;
        const middleRowsCount = Math.floor((maxDays - firstRowCellsCount) / 7);
        const lastRowCellsCount = maxDays - (firstRowCellsCount + (middleRowsCount * 7));

        const indexDate = getFirstDateOfMonth(this.year, this.month);

        let weekRow;

        weekRow = new WeekRow(indexDate, dayOfFirstDate);
        weekRow.setAsFirstWeek();
        this.rows.push(weekRow);

        for (let i = 0; i < middleRowsCount; i += 1) {
            weekRow = new WeekRow(indexDate);
            this.rows.push(weekRow);
        }

        weekRow = new WeekRow(indexDate, 0, 7 - lastRowCellsCount);
        weekRow.setAsLastWeek();
        this.rows.push(weekRow);
    }

    private makeMetadata() {
        this.weeksCount = this.rows.length;
        this.displayName = moment([this.year, this.month, 1]).format('YYYY MMM');
    }

    constructor(year, month) {
        this.year = year;
        this.month = month;

        this.render();
        this.makeMetadata();
    }
}

/**
 * Provide factory function for angular provider.
 * @example
 * import { Component, Inject } from '@angular/core';
 * import { CalendarTable } from './calendar-table';
 *
 * @Componnet({
 *     selector: 'app-some-comp',
 *     templateUrl: './some-comp.component.html',
 *     styleUrls: ['./some-comp.component.less']
 * })
 * export class SomeCompComponent {
 *     calendarTable: CalendarTable;
 *
 *     constructor(@Inject(CalendarTable) calendarTableFactory: any) {
 *         this.calendarTable = calendarTableFactory(2017, 7);
 *     }
 * }
 */
export function calendarTableFactory(year: number, month: number): CalendarTable {
    return new CalendarTable(year, month);
}
