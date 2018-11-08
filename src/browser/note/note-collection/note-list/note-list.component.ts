import { FocusKeyManager } from '@angular/cdk/a11y';
import { AfterViewInit, Component, HostListener, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { share, tap } from 'rxjs/operators';
import { NoteItem } from '../note-item.model';
// noinspection TypeScriptPreferShortImport
import { NoteItemComponent, NoteItemSelectionChange } from '../note-item/note-item.component';
import { NoteStateWithRoot } from '../../note.state';
import { NoteCollectionService } from '../note-collection.service';


@Component({
    selector: 'gd-note-list',
    templateUrl: './note-list.component.html',
    styleUrls: ['./note-list.component.scss'],
})
export class NoteListComponent implements OnInit, OnDestroy, AfterViewInit {
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

    /** Note selection stream from collection. */
    readonly selectedNote: Observable<NoteItem | null> = this.collection.getSelectedNote().pipe(share());

    /** Focus key manager for note items. */
    _focusKeyManager: FocusKeyManager<NoteItemComponent>;

    /** Query list for note items. */
    @ViewChildren(NoteItemComponent) private noteItemChildren: QueryList<NoteItemComponent>;
    private selectedNoteSubscription = Subscription.EMPTY;

    constructor(
        private store: Store<NoteStateWithRoot>,
        private collection: NoteCollectionService,
    ) {
    }

    private _isEmpty = false;

    get isEmpty(): boolean {
        return this._isEmpty;
    }

    private _initialLoaded = false;

    get initialLoaded(): boolean {
        return this._initialLoaded;
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
            noteElem => noteElem.note === note,
        );
    }
}
