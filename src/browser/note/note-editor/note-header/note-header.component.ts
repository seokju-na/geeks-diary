import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { NoteCollectionState, NoteItem } from '../../note-collection';
import { NoteStateWithRoot } from '../../note.state';


@Component({
    selector: 'gd-note-header',
    templateUrl: './note-header.component.html',
    styleUrls: ['./note-header.component.scss'],
})
export class NoteHeaderComponent implements OnInit, OnDestroy {
    selectedNote: NoteItem | null = null;

    private selectedNoteSubscription = Subscription.EMPTY;

    constructor(
        private store: Store<NoteStateWithRoot>,
    ) {
    }

    get noteSelectionExists(): boolean {
        return !!this.selectedNote;
    }

    ngOnInit(): void {
        this.selectedNoteSubscription = this.store.pipe(
            select(state => state.note.collection),
        ).subscribe((noteCollectionState: NoteCollectionState) => {
            this.selectedNote = noteCollectionState.selectedNote || null;
        });
    }

    ngOnDestroy(): void {
        this.selectedNoteSubscription.unsubscribe();
    }
}
