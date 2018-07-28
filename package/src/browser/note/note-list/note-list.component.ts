import { FocusKeyManager } from '@angular/cdk/a11y';
import { AfterViewInit, Component, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { share, tap } from 'rxjs/operators';
import { NoteItemComponent, NoteItemSelectionChange } from '../note-item/note-item.component';
import { NoteCollectionService } from '../shared/note-collection.service';
import { NoteItem } from '../shared/note-item.model';
import { NoteStateWithRoot } from '../shared/note.state';


@Component({
    selector: 'gd-note-list',
    templateUrl: './note-list.component.html',
    styleUrls: ['./note-list.component.scss'],
})
export class NoteListComponent implements OnInit, AfterViewInit {
    readonly notes: Observable<NoteItem[]> =  this.collection
        .getFilteredAndSortedNoteList().pipe(
            // Side effect for empty state and initial loaded.
            tap((notes) => {
                if (!this.initialLoaded) {
                    this.initialLoaded = true;
                }

                this.isEmpty = notes.length === 0;
            }),
        );

    readonly selectedNote: Observable<NoteItem | null> = this.collection
        .getSelectedNote().pipe(share());

    initialLoaded = false;
    isEmpty = false;

    _focusKeyManager: FocusKeyManager<NoteItemComponent>;
    @ViewChildren(NoteItemComponent) noteItemQueryList: QueryList<NoteItemComponent>;

    private selectedNoteSubscription = Subscription.EMPTY;

    constructor(
        private store: Store<NoteStateWithRoot>,
        private collection: NoteCollectionService,
    ) {

    }

    ngOnInit(): void {
        this.selectedNoteSubscription = this.selectedNote.subscribe((selectedNote) => {
            if (selectedNote && this._focusKeyManager) {
                const index = this.getIndexOfNote(selectedNote);

                if (index !== -1) {
                    this._focusKeyManager.updateActiveItem(index);
                }
            }
        });
    }

    ngAfterViewInit(): void {
        this._focusKeyManager = new FocusKeyManager(this.noteItemQueryList);
    }

    selectNote(event: NoteItemSelectionChange): void {
        const index = this.getIndexOfNote(event.source.note);

        if (index !== -1) {
            if (event.isUserInput) {
                this._focusKeyManager.setActiveItem(index);
            } else {
                this._focusKeyManager.updateActiveItem(index);
            }
        }

        this.collection.toggleNoteSelection(event.source.note);
    }

    isActiveItem(note: NoteItem): boolean {
        if (!this._focusKeyManager.activeItem) {
            return false;
        }

        // The reason for not simply comparing the active item index values
        // ​​here is that 'ExpressionChangedAfterItHasBeenCheckedError' occurs.
        //
        // The QueryList change is applied and the note value of the input
        // is compared to prevent the problem from occurring.
        return this._focusKeyManager.activeItem.note === note;
    }

    @HostListener('keydown', ['$event'])
    _handleKeyDown(event: KeyboardEvent): void {
        this._focusKeyManager.onKeydown(event);
    }

    private getIndexOfNote(note: NoteItem): number {
        const arrayItems = this.noteItemQueryList.toArray();

        if (!arrayItems) {
            return -1;
        }

        return this.noteItemQueryList.toArray().findIndex(
            noteElem => noteElem.note === note,
        );
    }
}
