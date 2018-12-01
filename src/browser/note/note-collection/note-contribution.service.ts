import { DatePipe } from '@angular/common';
import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { ContributionMeasurement } from '../../../core/contribution';
import { datetime, DateUnits } from '../../../libs/datetime';
import { toPromise } from '../../../libs/rx';
import { NoteStateWithRoot } from '../note.state';
import { NoteContributionTable } from './note-collection.state';


export enum NoteContributionLevel {
    NONE = 'NONE',
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
}


export const NOTE_CONTRIBUTION_MEASUREMENT =
    new InjectionToken<ContributionMeasurement<Date>>('NoteContributionMeasurement');


@Injectable()
export class NoteContributionService {
    static readonly keyFormat = 'y.MM.dd';

    /** NOTE(@seokju-na): Will change in future. */
    static getContributionLevel(count: number): NoteContributionLevel {
        if (count <= 0) {
            return NoteContributionLevel.NONE;
        } else if (count > 0 && count < 3) {
            return NoteContributionLevel.LOW;
        } else if (count >= 3 && count < 7) {
            return NoteContributionLevel.MEDIUM;
        } else if (count >= 7) {
            return NoteContributionLevel.HIGH;
        }
    }

    /** NOTE(@seokju-na): Will change in future. */
    static getColorForContributionLevel(level: NoteContributionLevel): string {
        switch (level) {
            case NoteContributionLevel.NONE:
                return 'transparent';
            case NoteContributionLevel.LOW:
                // green300
                return '#81c784';
            case NoteContributionLevel.MEDIUM:
                // green500
                return '#4caf50';
            case NoteContributionLevel.HIGH:
                // green800
                return '#2e7d32';
        }
    }

    readonly keyGenerator: (key: Date) => string;

    constructor(
        private store: Store<NoteStateWithRoot>,
        private datePipe: DatePipe,
        @Optional() @Inject(NOTE_CONTRIBUTION_MEASUREMENT)
        private measurement: ContributionMeasurement<Date>,
    ) {
        this.keyGenerator = (key: Date) => this.datePipe.transform(
            key,
            NoteContributionService.keyFormat,
        );
    }

    async measure(): Promise<NoteContributionTable> {
        const collectionState = await toPromise(this.store.pipe(
            select(state => state.note.collection),
            take(1),
        ));

        const { year, month } = collectionState.selectedMonth;

        const indexDate = datetime.getFirstDateOfMonth(year, month);
        const keys: Date[] = [];

        for (let i = 0; i < datetime.getDaysInMonth(year, month); i++) {
            keys.push(datetime.copy(indexDate));
            datetime.add(indexDate, DateUnits.DAY, 1);
        }

        const contribution = await this.measurement.measure(keys, this.keyGenerator);

        return contribution.items as NoteContributionTable;
    }
}
