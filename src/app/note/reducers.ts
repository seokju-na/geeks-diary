import { ActionReducerMap } from '@ngrx/store';
import { datetime } from '../../common/datetime';
import { AppState } from '../app-reducers';
import { NoteActions, NoteActionTypes } from './actions';
import {
    NoteFinderDateFilterTypes,
    NoteFinderSortDirection,
    NoteFinderSortTypes,
    NoteMetadata,
} from './models';


export interface NoteCollectionState {
    loaded: boolean;
    notes: NoteMetadata[];
    selectedNote: NoteMetadata | null;
}


export interface NoteFinderState {
    dateFilter: Date;
    dateFilterBy: NoteFinderDateFilterTypes;
    sortBy: NoteFinderSortTypes;
    sortDirection: NoteFinderSortDirection;
}


export interface NoteStateForFeature {
    collection: NoteCollectionState;
    finder: NoteFinderState;
}


export interface NoteStateWithRoot extends AppState {
    note: NoteStateForFeature;
}


export function createInitialNoteCollectionState(): NoteCollectionState {
    return {
        loaded: false,
        notes: [],
        selectedNote: null,
    };
}


export function createInitialNoteFinderState(): NoteFinderState {
    return {
        dateFilter: datetime.today(),
        dateFilterBy: NoteFinderDateFilterTypes.MONTH,
        sortBy: NoteFinderSortTypes.CREATED,
        sortDirection: NoteFinderSortDirection.ASC,
    };
}


export function noteCollectionReducer(
    state = createInitialNoteCollectionState(),
    action: NoteActions,
): NoteCollectionState {

    switch (action.type) {
        case NoteActionTypes.GET_NOTE_COLLECTION_COMPLETE:
            return {
                ...state,
                loaded: true,
                notes: action.payload.notes,
            };

        case NoteActionTypes.SELECT_NOTE:
            return {
                ...state,
                selectedNote: action.payload.selectedNote,
            };

        default:
            return state;
    }
}



export function noteFinderReducer(
    state = createInitialNoteFinderState(),
    action: NoteActions,
): NoteFinderState {

    switch (action.type) {
        case NoteActionTypes.CHANGE_DATE_FILTER:
            return {
                ...state,
                dateFilter: action.payload.dateFilter,
                dateFilterBy: action.payload.dateFilterBy,
            };

        default:
            return state;
    }
}


export const noteReducerMap: ActionReducerMap<NoteStateForFeature> = {
    collection: noteCollectionReducer,
    finder: noteFinderReducer,
};
