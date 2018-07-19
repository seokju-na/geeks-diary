import { Injectable, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as path from 'path';
import { Observable, Subject, Subscription } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { toPromise } from '../../../libs/rx';
import { Note } from '../../../models/note';
import { FsService } from '../../core/fs.service';
import { WorkspaceService } from '../../core/workspace.service';
import {
    DeselectNoteAction,
    LoadNoteCollectionAction,
    LoadNoteCollectionCompleteAction,
    SelectNoteAction,
} from './note-collection.actions';
import { getNoteLabel, NoteItem } from './note-item.model';
import { NoteParser } from './note-parser';
import { NoteStateWithRoot } from './note.state';


@Injectable()
export class NoteCollectionService implements OnDestroy {
    private toggleNoteSelectionSubscription = Subscription.EMPTY;
    private readonly _toggleNoteSelection = new Subject<NoteItem>();

    constructor(
        private store: Store<NoteStateWithRoot>,
        private parser: NoteParser,
        private fs: FsService,
        private workspace: WorkspaceService,
    ) {

        this.subscribeToggles();
    }

    ngOnDestroy(): void {
        this.toggleNoteSelectionSubscription.unsubscribe();
    }

    /**
     * Load all notes and dispatch load note events.
     * @returns {Promise<void>}
     */
    async load(): Promise<void> {
        const notesDirPath = this.workspace.configs.notesDirPath;

        // 1) Dispatch 'LOAD_COLLECTION' action.
        this.store.dispatch(new LoadNoteCollectionAction());

        // 2) Get all notes.
        const noteFileNames = await toPromise(this.fs.readDirectory(notesDirPath));
        const readingNotes = [];

        noteFileNames.forEach((fileName) => {
            const filePath = path.resolve(notesDirPath, fileName);
            readingNotes.push(toPromise(this.fs.readFile(filePath)));
        });

        // 3) Change notes to note items.
        const results = await Promise.all(readingNotes);
        const noteItems: NoteItem[] = results.map((result, index) => {
            const note = JSON.parse(result.toString()) as Note;
            const noteItem: NoteItem = {
                ...note,
                fileName: noteFileNames[index],
                filePath: path.resolve(notesDirPath, noteFileNames[index]),
            };
            const label = getNoteLabel(note, this.workspace.configs.rootDirPath);

            if (label) {
                return { ...noteItem, label };
            } else {
                return noteItem;
            }
        });

        // 4) Dispatch 'LOAD_COLLECTION_COMPLETE' action.
        this.store.dispatch(new LoadNoteCollectionCompleteAction({
            notes: noteItems,
        }));
    }

    getFilteredAndSortedNoteList(waitForInitial: boolean = true): Observable<NoteItem[]> {
        return this.store.pipe(
            select(state => state.note.collection),
            filter(state => waitForInitial
                ? state.loaded
                : true,
            ),
            select(state => state.filteredAndSortedNotes),
        );
    }

    getSelectedNote(waitForInitial: boolean = true): Observable<NoteItem | null> {
        return this.store.pipe(
            select(state => state.note.collection),
            filter(state => waitForInitial
                ? state.loaded
                : true,
            ),
            select(state => state.selectedNote),
        );
    }

    toggleNoteSelection(note: NoteItem): void {
        this._toggleNoteSelection.next(note);
    }

    selectNote(note: NoteItem): void {
        this.store.dispatch(new SelectNoteAction({ note }));
    }

    deselectNote(): void {
        this.store.dispatch(new DeselectNoteAction());
    }

    createNewNote(): void {
    }

    deleteNote(): void {
    }

    private subscribeToggles(): void {
        this.toggleNoteSelectionSubscription =
            this._toggleNoteSelection.asObservable().pipe(
                switchMap(note =>
                    this.getSelectedNote(false).pipe(
                        take(1),
                        map(selectedNote => ([selectedNote, note])),
                    ),
                ),
            ).subscribe(([selectedNote, note]) =>
                this.handleNoteSelectionToggling(selectedNote, note),
            );
    }

    private handleNoteSelectionToggling(
        selectedNote: NoteItem,
        note: NoteItem,
    ): void {

        if (selectedNote && selectedNote.id === note.id) {
            this.deselectNote();
        } else {
            this.selectNote(note);
        }
    }
}
