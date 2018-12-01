import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { map, share, tap } from 'rxjs/operators';
import { datetime, DateUnits } from '../../../../libs/datetime';
import { CalendarTable, CalendarTableCell } from '../../../ui/datetime';
import { NoteStateWithRoot } from '../../note.state';
import { SelectDateFilterAction, SelectMonthFilterAction } from '../note-collection.actions';
import { NoteContributionTable } from '../note-collection.state';
import { NoteContributionService } from '../note-contribution.service';


@Component({
    selector: 'gd-note-calendar',
    templateUrl: './note-calendar.component.html',
    styleUrls: ['./note-calendar.component.scss'],
})
export class NoteCalendarComponent implements OnInit, OnDestroy {
    readonly calendar = new CalendarTable();

    private currentDateCache: Date | null = null;
    readonly currentDate: Observable<Date> = this.store.pipe(
        select(state => state.note.collection.selectedMonth),
        map(selection => new Date(selection.year, selection.month)),
        tap((indexDate) => {
            this.currentDateCache = datetime.copy(indexDate);
            this.calendar.render(indexDate.getFullYear(), indexDate.getMonth());
        }),
    );

    private selectedDateCache: Date | null = null;
    readonly selectedDate: Observable<Date | null> = this.store.pipe(
        select(state => state.note.collection.selectedDate),
        map(selection => selection
            ? new Date(selection.year, selection.month, selection.date)
            : null,
        ),
        tap(value => this.selectedDateCache = value),
        share(),
    );

    private contribution: NoteContributionTable;
    private contributionSubscription = Subscription.EMPTY;

    constructor(
        private store: Store<NoteStateWithRoot>,
        private sanitizer: DomSanitizer,
        private datePipe: DatePipe,
    ) {
    }

    get canNavigateNextMonth(): boolean {
        if (this.currentDateCache) {
            return !datetime.isAfterOrSame(this.currentDateCache, datetime.today(), DateUnits.MONTH);
        } else {
            return false;
        }
    }

    ngOnInit(): void {
        this.calendar.renderThisMonth();
        this.contributionSubscription = this.store.pipe(
            select(state => state.note.collection.contribution),
        ).subscribe(contribution => this.contribution = contribution);
    }

    ngOnDestroy(): void {
        this.contributionSubscription.unsubscribe();
    }

    decreaseMonth(): void {
        if (!this.currentDateCache) {
            return;
        }

        const previousMonth = datetime.copy(this.currentDateCache);
        datetime.add(previousMonth, DateUnits.MONTH, -1);

        this.store.dispatch(new SelectMonthFilterAction({ date: previousMonth }));
    }

    increaseMonth(): void {
        if (!this.currentDateCache) {
            return;
        }

        const nextMonth = datetime.copy(this.currentDateCache);
        datetime.add(nextMonth, DateUnits.MONTH, 1);

        this.store.dispatch(new SelectMonthFilterAction({ date: nextMonth }));
    }

    goToToday(): void {
        this.store.dispatch(new SelectMonthFilterAction({ date: datetime.today() }));
    }

    isCellSelected(cell: CalendarTableCell): boolean {
        if (cell.isBlank() || !this.selectedDateCache) {
            return false;
        }

        return datetime.isSameDay(cell.date, this.selectedDateCache);
    }

    selectDateCell(cell: CalendarTableCell): void {
        if (this.isCellSelected(cell)) {
            this.store.dispatch(new SelectMonthFilterAction({ date: this.currentDateCache }));
        } else {
            this.store.dispatch(new SelectDateFilterAction({ date: cell.date }));
        }
    }

    getContributionColorForCell(cell: CalendarTableCell): SafeStyle {
        if (cell.isBlank()) {
            return '';
        }

        const key = this.datePipe.transform(cell.date, NoteContributionService.keyFormat);
        const count = (this.contribution || {})[key];

        const level = NoteContributionService.getContributionLevel(count);
        const color = NoteContributionService.getColorForContributionLevel(level);

        return this.sanitizer.bypassSecurityTrustStyle(`0 -2px 0 0 ${color} inset`);
    }
}
