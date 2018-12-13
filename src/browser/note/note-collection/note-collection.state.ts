import { SortDirection } from '../../../core/sorting';
import { datetime } from '../../../libs/datetime';
import { NoteItem } from './note-item.model';


export enum NoteCollectionFilterBy {
    BY_DATE = 'BY_DATE',
    BY_MONTH = 'BY_MONTH',
}


export enum NoteCollectionSortBy {
    CREATED = 'CREATED',
    TITLE = 'TITLE',
}


export enum NoteCollectionViewModes {
    VIEW_DETAIL = 'VIEW_DETAIL',
    VIEW_SIMPLE = 'VIEW_SIMPLE',
}


export interface NoteContributionTable {
    [key: string]: number;
}


export interface NoteCollectionState {
    readonly loading: boolean;
    readonly loaded: boolean;

    readonly selectedNote: NoteItem;
    readonly notes: NoteItem[];
    readonly filteredAndSortedNotes: NoteItem[];
    readonly contribution: NoteContributionTable;

    readonly filterBy: NoteCollectionFilterBy;
    readonly sortBy: NoteCollectionSortBy;
    readonly sortDirection: SortDirection;

    readonly selectedMonth: { year: number, month: number };
    readonly selectedDate: { year: number, month: number, date: number } | null;

    readonly viewMode: NoteCollectionViewModes;
}


export function createNoteCollectionInitialState(): NoteCollectionState {
    const today = datetime.today();
    const year = today.getFullYear();
    const month = today.getMonth();

    return {
        loading: false,
        loaded: false,
        selectedNote: null,
        notes: [],
        filteredAndSortedNotes: [],
        contribution: {},
        filterBy: NoteCollectionFilterBy.BY_MONTH,
        sortBy: NoteCollectionSortBy.CREATED,
        sortDirection: SortDirection.DESC,
        selectedMonth: { year, month },
        selectedDate: null,
        viewMode: NoteCollectionViewModes.VIEW_DETAIL,
    };
}
