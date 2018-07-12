import { TestBed } from '@angular/core/testing';
import { datetime } from '../../../libs/datetime';
import { CALENDAR_TABLE, CalendarTable, CalendarTableFactory, CalendarTableProvider } from './calendar-table';


describe('browser.ui.CalendarTable', () => {
    let factory: CalendarTableFactory;
    let calendar: CalendarTable;

    const validateCalendar = (table: any[][]): void => {
        const errors = [];

        for (let i = 0; i < table.length; i++) {
            for (let j = 0; j < table[i].length; j++) {
                const cell = calendar.rows[i].cells[j];
                const value = table[i][j];

                if (value === 'blank' && !cell.isBlank()) {
                    errors.push(`[${i}][${j}] Not blank cell.`);
                }

                if (typeof value === 'number') {
                    const date = new Date(calendar.year, calendar.month, value);

                    if (!datetime.isSameDay(date, cell.date)) {
                        errors.push(`[${i}][${j}] Date not matched.`);
                    }
                }
            }
        }

        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [CalendarTableProvider],
        });
    });

    beforeEach(() => {
        factory = TestBed.get(CALENDAR_TABLE);
        calendar = factory();
    });

    it('should render date cells correctly at July, 2018.', () => {
        /**
         * Calendar for 2018 July.
         * (x = blank)
         *
         * S  M  T  W  T  F  S
         * 1  2  3  4  5  6  7
         * 8  9  10 11 12 13 14
         * 15 16 17 18 19 20 21
         * 22 23 24 25 26 27 28
         * 29 30 31 x  x  x  x
         */

        const table = [
            [1, 2, 3, 4, 5, 6, 7],
            [8, 9, 10, 11, 12, 13, 14],
            [15, 16, 17, 18, 19, 20, 21],
            [22, 23, 24, 25, 26, 27, 28],
            [29, 30, 31, 'blank', 'blank', 'blank', 'blank'],
        ];

        calendar.render(2018, 7 - 1);

        validateCalendar(table);
    });

    it('should render date cells correctly at June, 2018.', () => {
        /**
         * Calendar for 2018 June.
         * (x = blank)
         *
         * S  M  T  W  T  F  S
         * x  x  x  x  x  1  2
         * 3  4  5  6  7  8  9
         * 10 11 12 13 14 15 16
         * 17 18 19 20 21 22 23
         * 24 25 26 27 28 29 30
         */

        const table = [
            ['blank', 'blank', 'blank', 'blank', 'blank', 1, 2],
            [3, 4, 5, 6, 7, 8, 9],
            [10, 11, 12, 13, 14, 15, 16],
            [17, 18, 19, 20, 21, 22, 23],
            [24, 25, 26, 27, 28, 29, 30],
        ];

        calendar.render(2018, 6 - 1);

        validateCalendar(table);
    });
});
