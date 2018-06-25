import { Injectable, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, Subject, Subscription } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { SaveUserDataAction } from '../../core/actions';
import { DeselectNoteAction, LoadNoteContentAction, SelectNoteAction } from '../actions';
import { NoteMetadata } from '../models';
import { NoteStateForFeature, NoteStateWithRoot } from '../reducers';


@Injectable()
export class NoteSelectionService implements OnDestroy {
    readonly selectedNote = this.store.pipe(
        filter(state => state.note.collection.loaded),
        select(state => state.note.collection.selectedNote),
    );

    private readonly _selectLastOpenedNote = new Subject<void>();
    private selectLastOpenedNoteSubscription: Subscription;
    private readonly _toggleNoteSelection = new Subject<NoteMetadata>();
    private toggleNoteSelectionSubscription: Subscription;
    private readonly _applyNoteSelectionByFilterChanges = new Subject<void>();
    private applyNoteSelectionByFilterChangesSubscription: Subscription;

    private readonly _afterSelectLastOpenedNote = new Subject<NoteMetadata>();

    constructor(private store: Store<NoteStateWithRoot>) {
        this.selectLastOpenedNoteSubscription =
            this._selectLastOpenedNote
                .asObservable()
                .pipe(switchMap(() => this.store.pipe(
                    filter(state =>
                        state.note.collection.loaded
                        && state.userData.loaded,
                    ),
                    take(1),
                )))
                .subscribe((state) => {
                    this.handleLastOpenedNoteSelecting(state);
                });

        this.toggleNoteSelectionSubscription =
            this._toggleNoteSelection
                .asObservable()
                .pipe(
                    switchMap(note =>
                        this.selectedNote.pipe(
                            take(1),
                            map(selectedNote => ([selectedNote, note])),
                        ),
                    ),
                )
                .subscribe(([selectedNote, note]) =>
                    this.handleNoteSelectionToggling(selectedNote, note),
                );

        this.applyNoteSelectionByFilterChangesSubscription =
            this._applyNoteSelectionByFilterChanges
                .asObservable()
                .pipe(switchMap(() => this.store.pipe(
                    select(state => state.note),
                    take(1),
                )))
                .subscribe(noteState =>
                    this.handleNoteSelectionApplyingByFilterChanges(noteState),
                );
    }

    ngOnDestroy(): void {
        this.selectLastOpenedNoteSubscription.unsubscribe();
        this.toggleNoteSelectionSubscription.unsubscribe();
        this.applyNoteSelectionByFilterChangesSubscription.unsubscribe();

        this._selectLastOpenedNote.complete();
        this._toggleNoteSelection.complete();
        this._applyNoteSelectionByFilterChanges.complete();
        this._afterSelectLastOpenedNote.complete();
    }

    afterSelectLastOpenedNote(): Observable<NoteMetadata> {
        return this._afterSelectLastOpenedNote.asObservable();
    }

    selectLastOpenedNote(): void {
        this._selectLastOpenedNote.next();
    }

    toggleNoteSelection(note: NoteMetadata): void {
        this._toggleNoteSelection.next(note);
    }

    selectNote(note: NoteMetadata): void {
        this.store.dispatch(new SelectNoteAction({ selectedNote: note }));
        this.store.dispatch(new LoadNoteContentAction({ note }));
        this.store.dispatch(new SaveUserDataAction({
            userData: { lastOpenedNote: note },
        }));
    }

    deselectNote(): void {
        this.store.dispatch(new DeselectNoteAction());
        this.store.dispatch(new SaveUserDataAction({
            userData: { lastOpenedNote: null },
        }));
    }

    applyNoteSelectionByFilterChanges(): void {
        this._applyNoteSelectionByFilterChanges.next();
    }

    private handleLastOpenedNoteSelecting(state: NoteStateWithRoot): void {
        const lastOpenedNote = state.userData.data.lastOpenedNote;

        if (lastOpenedNote) {
            this.store.dispatch(new SelectNoteAction({ selectedNote: lastOpenedNote }));
            this.store.dispatch(new LoadNoteContentAction({ note: lastOpenedNote }));
            this._afterSelectLastOpenedNote.next(lastOpenedNote);
        }
    }

    private handleNoteSelectionToggling(
        selectedNote: NoteMetadata,
        note: NoteMetadata,
    ): void {

        if (selectedNote && selectedNote.id === note.id) {
            this.deselectNote();
        } else {
            this.selectNote(note);
        }
    }

    private handleNoteSelectionApplyingByFilterChanges(
        noteState: NoteStateForFeature,
    ): void {

        const notes = noteState.collection.notes;
        const filteredNotes = NoteMetadata.filterByDate(
            notes,
            noteState.finder.dateFilter,
            noteState.finder.dateFilterBy,
        );

        NoteMetadata.sort(
            filteredNotes,
            noteState.finder.sortBy,
            noteState.finder.sortDirection,
        );

        // If note collection is empty and selected note is exists, deselect note.
        // Else if collection is not empty, select first note.
        const isFilteredNotesEmpty = filteredNotes.length === 0;

        if (noteState.collection.selectedNote && isFilteredNotesEmpty) {
            this.deselectNote();
        } else if (!isFilteredNotesEmpty) {
            this.selectNote(filteredNotes[0]);
        }
    }
}
