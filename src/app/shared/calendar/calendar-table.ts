import { InjectionToken } from '@angular/core';
import { datetime, DateUnits } from '../../../common/datetime';


export class CalendarTableCell {
    date: Date | null = null;

    constructor(date?: Date) {
        if (date) {
            this.date = datetime.copy(date);
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

    constructor(index: Date,
                beforeBlankCellCount: number,
                afterBlankCellCount: number) {

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

    private year: number;
    private month: number;

    render(year: number, month: number): void {
        this.rows = [];

        this.year = year;
        this.month = month;

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

function CALENDAR_TABLE_FACTORY(): CalendarTableFactory {
    return () => new CalendarTable();
}

export const CalendarTableProvider = {
    provide: CALENDAR_TABLE,
    deps: [],
    useFactory: CALENDAR_TABLE_FACTORY,
};
