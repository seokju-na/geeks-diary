import { DatePipe } from '@angular/common';
import { Injectable, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as path from 'path';
import { Observable, Subject, Subscription, zip } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { makeNoteContentFileName, Note, NoteSnippetTypes } from '../../../core/note';
import { VcsFileChange, VcsFileChangeStatusTypes } from '../../../core/vcs';
import { isOutsidePath } from '../../../libs/path';
import { toPromise } from '../../../libs/rx';
import { uuid } from '../../../libs/uuid';
import { FsService, WorkspaceService } from '../../shared';
import { NoteContentFileAlreadyExistsError, NoteOutsideWorkspaceError } from '../note-errors';
import { convertToNoteSnippets, NoteParser } from '../note-shared';
import { NoteStateWithRoot } from '../note.state';
import {
    AddNoteAction,
    ChangeNoteTitleAction,
    DeselectNoteAction,
    LoadNoteCollectionAction,
    LoadNoteCollectionCompleteAction,
    SelectNoteAction,
} from './note-collection.actions';
import { getNoteLabel, NoteItem } from './note-item.model';


@Injectable()
export class NoteCollectionService implements OnDestroy {
    private toggleNoteSelectionSubscription = Subscription.EMPTY;
    private readonly _toggleNoteSelection = new Subject<NoteItem>();

    // noinspection JSMismatchedCollectionQueryUpdate
    private vcsFileChanges: VcsFileChange[] = [];
    private vcsFileChangesSubscription = Subscription.EMPTY;

    constructor(
        private store: Store<NoteStateWithRoot>,
        private parser: NoteParser,
        private fs: FsService,
        private workspace: WorkspaceService,
        private datePipe: DatePipe,
    ) {
        this.subscribeToggles();
    }

    ngOnDestroy(): void {
        this.toggleNoteSelectionSubscription.unsubscribe();
        this.vcsFileChangesSubscription.unsubscribe();
    }

    provideVcsFileChanges(fileChanges: Observable<VcsFileChange[]>): void {
        this.vcsFileChangesSubscription = fileChanges.subscribe(changes => this.vcsFileChanges = changes);
    }

    /**
     * Load all notes and dispatch loadOnce note events.
     * @returns {Promise<void>}
     */
    async loadOnce(): Promise<void> {
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
            filter(state => waitForInitial ? state.loaded : true),
            select(state => state.filteredAndSortedNotes),
        );
    }

    getSelectedNote(waitForInitial: boolean = true): Observable<NoteItem | null> {
        return this.store.pipe(
            select(state => state.note.collection),
            filter(state => waitForInitial ? state.loaded : true),
            select(state => state.selectedNote),
        );
    }

    getNoteVcsFileChangeStatus(note: NoteItem): VcsFileChangeStatusTypes | null {
        const { contentFilePath, filePath } = note;
        const matchedFilePaths = [contentFilePath, filePath];
        const fileChange = this.vcsFileChanges.find(
            change => matchedFilePaths.includes(change.absoluteFilePath),
        );

        return fileChange ? fileChange.status : null;
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

        const contentFileName = makeNoteContentFileName(createdAt, title);
        const contentFilePath = path.resolve(rootDirPath, directory, contentFileName);

        if (isOutsidePath(contentFilePath, rootDirPath)) {
            throw new NoteOutsideWorkspaceError();
        }

        if (await toPromise(this.fs.isPathExists(contentFilePath))) {
            throw new NoteContentFileAlreadyExistsError();
        }

        const content = {
            snippets: [
                {
                    type: NoteSnippetTypes.TEXT,
                    value: 'Write some content...',
                },
            ],
        };

        const result = this.parser.parseNoteContent(content, {
            metadata: {
                title,
                date: this.datePipe.transform(new Date(), 'E, d MMM yyyy HH:mm:ss Z'),
                stacks: [],
            },
        });

        const id = uuid();
        const noteFileName = `${id}.json`;
        const noteFilePath = path.resolve(this.workspace.configs.notesDirPath, noteFileName);

        const note: Note = {
            id,
            title,
            snippets: convertToNoteSnippets(result.parsedSnippets),
            createdDatetime: createdAt,
            stackIds: [],
            contentFileName,
            contentFilePath,
        };
        const contentRawValue = result.contentRawValue;

        /**
         * Make sure to ensure the directory where content file will saved.
         */
        await toPromise(this.fs.ensureDirectory(path.dirname(contentFilePath)));

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

    async changeNoteTitle(noteItem: NoteItem, newTitle: string): Promise<void> {
        const dirName = path.dirname(noteItem.contentFilePath);
        const newContentFileName = makeNoteContentFileName(noteItem.createdDatetime, newTitle);
        const newContentFilePath = path.resolve(dirName, newContentFileName);

        // If content file name is same, just ignore.
        if (newContentFileName === noteItem.contentFileName) {
            return;
        }

        if (await toPromise(this.fs.isPathExists(newContentFilePath))) {
            throw new NoteContentFileAlreadyExistsError();
        }

        const note: Note = {
            id: noteItem.id,
            title: newTitle,
            snippets: noteItem.snippets,
            stackIds: noteItem.stackIds,
            contentFileName: newContentFileName,
            contentFilePath: newContentFilePath,
            createdDatetime: noteItem.createdDatetime,
        };

        await toPromise(zip(
            this.fs.writeJsonFile<Note>(noteItem.filePath, note),
            this.fs.renameFile(noteItem.contentFilePath, newContentFilePath),
        ));

        this.store.dispatch(new ChangeNoteTitleAction({
            note: noteItem,
            title: newTitle,
            contentFileName: newContentFileName,
            contentFilePath: newContentFilePath,
        }));
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
