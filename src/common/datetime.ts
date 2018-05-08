export enum DateUnits {
    MILLISECOND = 'MILLISECOND',
    SECOND = 'SECOND',
    MINUTE = 'MINUTE',
    HOUR = 'HOUR',
    DAY = 'DAY',
    WEEK = 'WEEK',
    MONTH = 'MONTH',
    YEAR = 'YEAR',
}


class Datetime {
    copy(date: Date): Date {
        return new Date(date.toString());
    }

    today(): Date {
        return new Date();
    }

    shortFormat(date: Date): string {
        const year = date.getFullYear().toString().slice(2, 4);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    add(date: Date, unit: DateUnits, value: number): void {
        switch (unit) {
            case DateUnits.MILLISECOND:
                date.setMilliseconds(date.getMilliseconds() + value);
                break;
            case DateUnits.SECOND:
                date.setMilliseconds(date.getMilliseconds() + value * 1000);
                break;
            case DateUnits.MINUTE:
                date.setMilliseconds(date.getMilliseconds() + value * 1000 * 60);
                break;
            case DateUnits.HOUR:
                date.setMilliseconds(date.getMilliseconds() + value * 1000 * 60 * 60);
                break;
            case DateUnits.DAY:
                date.setDate(date.getDate() + value);
                break;
            case DateUnits.WEEK:
                date.setDate(date.getDate() + value * 7);
                break;
            case DateUnits.MONTH:
                const n = date.getDate();

                date.setDate(1);
                date.setMonth(date.getMonth() + value);
                date.setDate(Math.min(n, this.getDaysInMonth(date.getFullYear(), date.getMonth())));
                break;
            case DateUnits.YEAR:
                this.add(date, DateUnits.MONTH, value * 12);
                break;
        }
    }

    isLeapYear(year: number): boolean {
        return ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0);
    }

    getDaysInMonth(year: number, month: number): number {
        const febMonth = this.isLeapYear(year) ? 29 : 28;

        return [31, febMonth, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
    }

    getFirstDateOfMonth(year: number, month: number): Date {
        return new Date(year, month, 1);
    }

    getLastDateOfMonth(year: number, month: number): Date {
        return new Date(year, month + 1, 0);
    }

    getStartOfDay(date: Date): Date {
        const distDate = this.copy(date);
        distDate.setHours(0, 0, 0, 0);

        return distDate;
    }

    isSameDay(source: Date, target: Date): boolean {
        const sourceStartOfDay = this.getStartOfDay(source);
        const targetStartOfDay = this.getStartOfDay(target);

        return sourceStartOfDay.getTime() === targetStartOfDay.getTime();
    }

    isAtSameMonth(source: Date, target: Date): boolean {
        const sourceYear = source.getFullYear();
        const sourceMonth = source.getMonth();
        const targetYear = target.getFullYear();
        const targetMonth = target.getMonth();

        return sourceYear === targetYear
            && sourceMonth === targetMonth;
    }
}


export const datetime = new Datetime();
