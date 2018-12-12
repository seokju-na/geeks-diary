import { FocusKeyManager } from '@angular/cdk/a11y';
import { AfterViewInit, Component, HostListener, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NoteStateWithRoot } from '../../note.state';
import { NoteCollectionService } from '../note-collection.service';
import { NoteItem } from '../note-item.model';
// noinspection TypeScriptPreferShortImport
import { NoteItemComponent, NoteItemSelectionChange } from '../note-item/note-item.component';


@Component({
    selector: 'gd-note-list',
    templateUrl: './note-list.component.html',
    styleUrls: ['./note-list.component.scss'],
})
export class NoteListComponent implements OnInit, OnDestroy, AfterViewInit {
    private _isEmpty = false;

    get isEmpty(): boolean {
        return this._isEmpty;
    }

    private _initialLoaded = false;

    get initialLoaded(): boolean {
        return this._initialLoaded;
    }

    /** Filtered and sorted notes stream from collection. */
    readonly notes: Observable<NoteItem[]> = this.collection
        .getFilteredAndSortedNoteList().pipe(
            // Side effect for empty state and initial loaded.
            tap((notes) => {
                if (!this._initialLoaded) {
                    this._initialLoaded = true;
                }

                this._isEmpty = notes.length === 0;
            }),
        );
    /** Focus key manager for note items. */
    _focusKeyManager: FocusKeyManager<NoteItemComponent>;

    /** Query list for note items. */
    @ViewChildren(NoteItemComponent) private noteItemChildren: QueryList<NoteItemComponent>;

    private _selectedNote: NoteItem | null = null;
    private selectedNoteSubscription = Subscription.EMPTY;

    constructor(
        private store: Store<NoteStateWithRoot>,
        private collection: NoteCollectionService,
    ) {
    }

    ngOnInit(): void {
        this.selectedNoteSubscription = this.collection
            .getSelectedNote(true)
            .subscribe(selectedNote => this._selectedNote = selectedNote);
    }

    ngOnDestroy(): void {
        this.selectedNoteSubscription.unsubscribe();
    }

    ngAfterViewInit(): void {
        this._focusKeyManager = new FocusKeyManager(this.noteItemChildren).withVerticalOrientation(true);
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

    isSelectedItem(note: NoteItem): boolean {
        if (this._selectedNote) {
            return this._selectedNote.id === note.id;
        } else {
            return false;
        }
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
    private handleKeyDown(event: KeyboardEvent): void {
        this._focusKeyManager.onKeydown(event);
    }

    private getIndexOfNote(note: NoteItem): number {
        const arrayItems = this.noteItemChildren.toArray();

        if (!arrayItems) {
            return -1;
        }

        return this.noteItemChildren.toArray().findIndex(
            noteElem => noteElem.note.id === note.id,
        );
    }
}
