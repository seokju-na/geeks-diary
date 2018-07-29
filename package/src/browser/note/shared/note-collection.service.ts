import { Injectable, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as path from 'path';
import { Observable, Subject, Subscription, zip } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { isOutsidePath } from '../../../libs/path';
import { toPromise } from '../../../libs/rx';
import { uuid } from '../../../libs/uuid';
import { makeContentFileName, Note } from '../../../models/note';
import { NoteSnippetTypes } from '../../../models/note-snippet';
import { FsService } from '../../core/fs.service';
import { WorkspaceService } from '../../core/workspace.service';
import {
    AddNoteAction,
    DeselectNoteAction,
    LoadNoteCollectionAction,
    LoadNoteCollectionCompleteAction,
    SelectNoteAction,
} from './note-collection.actions';
import { NoteError, NoteErrorCodes } from './note-errors';
import { getNoteLabel, NoteItem } from './note-item.model';
import { NoteParser } from './note-parser';
import { convertToNoteSnippets } from './note-parsing.models';
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
        const readingNotes: Promise<Note | null>[] = [];

        noteFileNames.forEach((fileName) => {
            const filePath = path.resolve(notesDirPath, fileName);
            readingNotes.push(toPromise(this.fs.readJsonFile<Note>(filePath)));
        });

        // 3) Change notes to note items.
        const results = await Promise.all(readingNotes);
        const noteItems: NoteItem[] = results
            .filter(note => note !== null)
            .map((note: Note, index) => {
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

    async createNewNote(title: string, directory: string = ''): Promise<void> {
        const rootDirPath = this.workspace.configs.rootDirPath;

        const createdAt = new Date().getTime();

        const contentFileName = makeContentFileName(createdAt, title);
        const contentFilePath = path.resolve(
            rootDirPath,
            directory,
            contentFileName,
        );

        if (isOutsidePath(contentFilePath, rootDirPath)) {
            throw new NoteError(NoteErrorCodes.OUTSIDE_WORKSPACE);
        }

        if (await toPromise(this.fs.isPathExists(contentFilePath))) {
            throw new NoteError(NoteErrorCodes.CONTENT_FILE_EXISTS);
        }

        const content = {
            snippets: [{
                type: NoteSnippetTypes.TEXT,
                value: 'Write some content...',
            }],
        };

        const result = this.parser.parseNoteContent(content, {
            metadata: {
                title,
                date: new Date(createdAt).toString(),
                stacks: [],
            },
        });

        const id = uuid();
        const noteFileName = `${id}.json`;
        const noteFilePath = path.resolve(
            this.workspace.configs.notesDirPath,
            noteFileName,
        );

        const note: Note = {
            id,
            title,
            snippets: convertToNoteSnippets(result.parsedSnippets),
            createdDatetime: createdAt,
            updatedDatetime: createdAt,
            stackIds: [],
            contentFileName,
            contentFilePath,
        };
        const contentRawValue = result.contentRawValue;

        await toPromise(zip(
            this.fs.writeJsonFile<Note>(noteFilePath, note),
            this.fs.writeFile(contentFilePath, contentRawValue),
        ));

        // Dispatch 'ADD_NOTE' action.
        let noteItem: NoteItem = {
            ...note,
            fileName: noteFileName,
            filePath: noteFilePath,
        };
        const label = getNoteLabel(note, rootDirPath);

        if (label) {
            noteItem = { ...noteItem, label };
        }

        this.store.dispatch(new AddNoteAction({ note: noteItem }));
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
