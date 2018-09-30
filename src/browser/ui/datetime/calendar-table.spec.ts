import { datetime } from '../../../libs/datetime';
import { CalendarTable } from './calendar-table';


describe('browser.ui.datetime.CalendarTable', () => {
    let calendar: CalendarTable;

    /** Validates if calendar rendered well. */
    function validateCalendar(table: (string | number)[][]): void {
        const errors = [];

        for (let i = 0; i < table.length; i++) {
            for (let j = 0; j < table[i].length; j++) {
                const cell = calendar.rows[i].cells[j];
                const value = table[i][j];

                if (value === 'b' && !cell.isBlank()) {
                    errors.push(`[${i}][${j}] Not b cell.`);
                }

                if (typeof value === 'number') {
                    const date = calendar.currentMonth;
                    date.setDate(value);

                    if (!datetime.isSameDay(date, cell.date)) {
                        errors.push(`[${i}][${j}] Date not matched.`);
                    }
                }
            }
        }

        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
    }

    beforeEach(() => {
        calendar = new CalendarTable();
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
            [29, 30, 31, 'b', 'b', 'b', 'b'],
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
            ['b', 'b', 'b', 'b', 'b', 1, 2],
            [3, 4, 5, 6, 7, 8, 9],
            [10, 11, 12, 13, 14, 15, 16],
            [17, 18, 19, 20, 21, 22, 23],
            [24, 25, 26, 27, 28, 29, 30],
        ];

        calendar.render(2018, 6 - 1);

        validateCalendar(table);
    });
});
