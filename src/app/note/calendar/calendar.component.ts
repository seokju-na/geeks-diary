import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Inject,
    Input,
    Output,
} from '@angular/core';
import { datetime, DateUnits } from '../../../common/datetime';
import {
    CALENDAR_TABLE,
    CalendarTable,
    CalendarTableCell,
    CalendarTableFactory,
} from '../../shared/calendar/calendar-table';


export class NoteContributeTable {
    indexDate: Date;
    map: { [key: string]: number };
}


export type NoteContributionLevel = 'none' | 'low' | 'medium' | 'high';


@Component({
    selector: 'gd-note-calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteCalendarComponent {
    @Input()
    get indexDate() {
        return this._indexDate;
    }

    set indexDate(value: Date) {
        if (!value) {
            return;
        }

        this._indexDate = datetime.copy(value);
        this.renderTable();
    }

    @Input() selectedDate: Date;
    @Input() contributeTable: NoteContributeTable;
    @Output() changeIndexDate = new EventEmitter<Date>();
    @Output() selectDate = new EventEmitter<Date>();

    calendar: CalendarTable;

    private _indexDate: Date;

    constructor(@Inject(CALENDAR_TABLE) calendarFactory: CalendarTableFactory) {
        this.calendar = calendarFactory();
    }

    isCellSelected(cell: CalendarTableCell): boolean {
        if (cell.isBlank() || !this.selectedDate) {
            return;
        }

        return datetime.isSameDay(this.selectedDate, cell.date);
    }

    clickDateCell(cell: CalendarTableCell): void {
        if (cell.isBlank()) {
            return;
        }

        if (this.isCellSelected(cell)) {
            this.selectedDate = null;
            this.selectDate.emit(null);
            return;
        }

        this.selectedDate = datetime.copy(cell.date);
        this.selectDate.emit(this.selectedDate);
    }

    decreaseMonth(): void {
        const distDate = datetime.copy(this.indexDate);
        datetime.add(distDate, DateUnits.MONTH, -1);

        this.indexDate = distDate;
        this.changeIndexDate.emit(distDate);
    }

    increaseMonth(): void {
        const distDate = datetime.copy(this.indexDate);
        datetime.add(distDate, DateUnits.MONTH, 1);

        this.indexDate = distDate;
        this.changeIndexDate.emit(distDate);
    }

    getContributionLevel(cell: CalendarTableCell): NoteContributionLevel {
        if (!this.contributeTable) {
            return 'none';
        }

        const noteCount = this.contributeTable.map[cell.id];

        if (!noteCount) {
            return 'none';
        }

        if (noteCount >= 10) {
            return 'high';
        } else if (noteCount >= 5 && noteCount < 10) {
            return 'medium';
        } else if (noteCount > 0 && noteCount < 5) {
            return 'low';
        }

        return 'none';
    }

    private renderTable(): void {
        this.calendar.render(this.indexDate.getFullYear(), this.indexDate.getMonth());
    }
}
