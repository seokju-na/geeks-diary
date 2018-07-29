import { datetime } from '../../../libs/datetime';
import { Sorting } from '../../../libs/sorting';
import { NoteCollectionFilterBy, NoteCollectionSortBy, NoteCollectionState } from './note-collection.state';
import { NoteItem } from './note-item.model';


const sorting = new Sorting<NoteItem>();


export function withFilteredAndSortedNotes(state: NoteCollectionState): NoteCollectionState {
    let notes: NoteItem[];

    // Filter notes.
    let filterSource;

    switch (state.filterBy) {
        case NoteCollectionFilterBy.BY_MONTH:
            filterSource = new Date(
                state.selectedMonth.year,
                state.selectedMonth.month,
            );

            notes = state.notes.filter(note =>
                datetime.isAtSameMonth(filterSource, new Date(note.createdDatetime)));

            break;

        case NoteCollectionFilterBy.BY_DATE:
            filterSource = new Date(
                state.selectedDate.year,
                state.selectedDate.month,
                state.selectedDate.date,
            );

            notes = state.notes.filter(note =>
                datetime.isSameDay(filterSource, new Date(note.createdDatetime)));

            break;

        default:
            notes = [...state.notes];
            break;
    }

    // Sort notes.
    switch (state.sortBy) {
        case NoteCollectionSortBy.CREATED:
            sorting.setIndexPropGetter(note => note.createdDatetime);
            break;

        case NoteCollectionSortBy.UPDATED:
            sorting.setIndexPropGetter(note => note.updatedDatetime);
            break;

        case NoteCollectionSortBy.TITLE:
            sorting.setIndexPropGetter(note => note.title);
            break;
    }

    sorting.setDirection(state.sortDirection);
    sorting.sort(notes);

    return {
        ...state,
        filteredAndSortedNotes: notes,
    };
}
