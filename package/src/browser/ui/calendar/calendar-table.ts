import { InjectionToken } from '@angular/core';
import { datetime, DateUnits } from '../../../libs/datetime';


export class CalendarTableCell {
    readonly label: string | null = null;
    date: Date | null = null;

    constructor(date?: Date) {
        if (date) {
            this.date = datetime.copy(date);
            this.label = datetime.shortFormat(this.date);
        }
    }

    isBlank(): boolean {
        return this.date === null;
    }

    isToday(): boolean {
        if (this.isBlank()) {
            return false;
        }

        return datetime.isSameDay(this.date, datetime.today());
    }
}


export class CalendarTableRow {
    cells: CalendarTableCell[] = [];

    constructor(
        index: Date,
        beforeBlankCellCount: number,
        afterBlankCellCount: number,
    ) {

        this.addBlankCell(beforeBlankCellCount);

        for (let i = 0; i < 7 - (beforeBlankCellCount + afterBlankCellCount); i++) {
            this.cells.push(new CalendarTableCell(index));
            datetime.add(index, DateUnits.DAY, 1);
        }

        this.addBlankCell(afterBlankCellCount);
    }

    private addBlankCell(count: number): void {
        for (let i = 0; i < count; i++) {
            this.cells.push(new CalendarTableCell());
        }
    }
}


export class CalendarTable {
    rows: CalendarTableRow[];

    private _year: number;
    private _month: number;

    get year(): number {
        return this._year;
    }

    get month(): number {
        return this._month;
    }

    render(year: number, month: number): void {
        this.rows = [];

        this._year = year;
        this._month = month;

        const firstDate = datetime.getFirstDateOfMonth(year, month);
        const dayOfFirstDate = firstDate.getDay();
        const maxDays = datetime
            .getLastDateOfMonth(year, month)
            .getDate();

        const firstRowCellsCount = 7 - dayOfFirstDate;
        const middleRowsCount = Math.floor((maxDays - firstRowCellsCount) / 7);
        const lastRowCellsCount = maxDays - (firstRowCellsCount + (middleRowsCount * 7));

        const indexDate = firstDate;

        let weekRow;

        weekRow = new CalendarTableRow(indexDate, dayOfFirstDate, 0);
        this.rows.push(weekRow);

        for (let i = 0; i < middleRowsCount; i += 1) {
            weekRow = new CalendarTableRow(indexDate, 0, 0);
            this.rows.push(weekRow);
        }

        if (lastRowCellsCount > 0) {
            weekRow = new CalendarTableRow(indexDate, 0, 7 - lastRowCellsCount);
            this.rows.push(weekRow);
        }
    }
}


export type CalendarTableFactory = () => CalendarTable;


export const CALENDAR_TABLE = new InjectionToken<CalendarTableFactory>('CalendarTable');


export function CALENDAR_TABLE_FACTORY(): CalendarTableFactory {
    return () => new CalendarTable();
}

export const CalendarTableProvider = {
    provide: CALENDAR_TABLE,
    deps: [],
    useFactory: CALENDAR_TABLE_FACTORY,
};
