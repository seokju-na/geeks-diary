import { datetime, DateUnits } from '../libs/datetime';
import { Builder } from './common-interfaces';
import { Note } from './note';


export type NoteContributionLevel = 'none' | 'low' | 'medium' | 'high';

const CONTRIBUTION_LOW_LEVEL_MIN_VALUE = 1;

const CONTRIBUTION_MEDIUM_LEVEL_MIN_VALUE = 3;


export enum NoteContributeMeasuringTypes {
    BY_DATE = 'BY_DATE',
    BY_MONTH = 'BY_MONTH',
    BY_STACK = 'BY_STACK',
}


export interface NoteContributeItem {
    /**
     * Id format are defined depending on the measuring type.
     *
     * BY_DATE : YY-MM-DD (short format for date)
     * BY_MONTH : YY-MM
     * BY_STACK : (Stack ID)
     */
    id: string;
    /** Level is not necessary when measuring type is 'BY_STACK'. */
    level?: NoteContributionLevel;
    count: number;
}


/**
 * Note contribute class.
 *
 * @example
 * const builder = new NoteContribute.Builder();
 *
 * builder.setType(NoteContributeMeasuringTypes.BY_DATE);
 * builder.setNotes(someNotes);
 * builder.setIndexDate(someIndexDate);
 *
 * const contribute = builder.build() as NoteContributeByDate;
 */
export abstract class NoteContribute {
    readonly contributionTotal: number;
    readonly items: NoteContributeItem[];

    static Builder = class NoteContributeBuilder extends Builder<NoteContribute> {
        private type: NoteContributeMeasuringTypes | null = null;
        private notes: Note[] | null = null;
        private indexDate: Date | null = null;

        setMeasuringType(type: NoteContributeMeasuringTypes): this {
            this.type = type;
            return this;
        }

        setNotes(notes: Note[]): this {
            this.notes = notes;
            return this;
        }

        setIndexDate(date: Date): this {
            this.indexDate = date;
            return this;
        }

        build(): NoteContribute {
            if (this.type === null) {
                throw new Error('Measuring type should be provided!');
            } else if (this.notes === null) {
                throw new Error('Notes should be provided!');
            }

            if (this.type === NoteContributeMeasuringTypes.BY_DATE
                && !this.indexDate) {

                throw new Error('Index date should be provided when measuring type is \'BY_DATE\'.');
            }

            switch (this.type) {
                case NoteContributeMeasuringTypes.BY_DATE:
                    return new NoteContributeByDate(this.type, this.notes, this.indexDate);
            }
        }
    };

    protected constructor(
        readonly type: NoteContributeMeasuringTypes,
        protected readonly notes: Note[],
    ) {

        this.type = type;
        this.contributionTotal = this.notes.length;
        this.items = this.createItems();
    }

    abstract createItems(): NoteContributeItem[];
    abstract equals(item: NoteContributeItem, ...extras: any[]): boolean;
}


/**
 * Concrete class for note contribute which measures contribution with date.
 */
export class NoteContributeByDate extends NoteContribute {
    constructor(
        type: NoteContributeMeasuringTypes,
        notes: Note[],
        private readonly indexDate: Date,
    ) {

        super(type, notes);
    }

    createItems(): NoteContributeItem[] {
        const year = this.indexDate.getFullYear();
        const month = this.indexDate.getMonth();

        const maxDays = datetime
            .getLastDateOfMonth(year, month)
            .getDate();

        const items: NoteContributeItem[] = [];
        const index = datetime.getFirstDateOfMonth(year, month);
        const averageCount = this.contributionTotal  / maxDays;

        for (let i = 0; i < maxDays; i++) {
            const count = this.notes
                .filter(note => datetime.isSameDay(new Date(note.createdDatetime), index))
                .length;

            const item: NoteContributeItem = {
                id: this.createIdFromDate(index),
                level: this.getContributionLevel(count, averageCount),
                count,
            };

            items.push(item);
            datetime.add(index, DateUnits.DAY, 1);
        }

        return items;
    }

    equals(item: NoteContributeItem, date: Date): boolean {
        return item.id === this.createIdFromDate(date);
    }

    private createIdFromDate(date: Date): string {
        return datetime.shortFormat(date);
    }

    private getContributionLevel(count: number, averageCount: number): NoteContributionLevel {
        const lowLevelMaximum = Math.max(2 * averageCount, CONTRIBUTION_LOW_LEVEL_MIN_VALUE);
        const mediumLevelMaximum = Math.max(3.5 * averageCount, CONTRIBUTION_MEDIUM_LEVEL_MIN_VALUE);

        if (count === 0) {
            return 'none';
        } else if (0 < count && count <= lowLevelMaximum) {
            return 'low';
        } else if (lowLevelMaximum < count && count <= mediumLevelMaximum) {
            return 'medium';
        } else if (mediumLevelMaximum < count) {
            return 'high';
        }
    }
}
