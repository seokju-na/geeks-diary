import { DatePipe } from '@angular/common';
import { Injectable, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { shell } from 'electron';
import * as path from 'path';
import { Observable, Subject, Subscription, zip } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
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
    ChangeNoteStacksAction,
    ChangeNoteTitleAction,
    DeleteNoteAction,
    DeselectNoteAction,
    LoadNoteCollectionAction,
    LoadNoteCollectionCompleteAction,
    SelectNoteAction,
} from './note-collection.actions';
import { NoteItem } from './note-item.model';


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
        const filteredNoteFileNames = noteFileNames.filter(
            fileName => path.extname(fileName) === '.json',
        );
        const readingNotes: Promise<Note | null>[] = [];

        filteredNoteFileNames.forEach((fileName) => {
            const filePath = path.resolve(notesDirPath, fileName);
            readingNotes.push(toPromise(this.fs.readJsonFile<Note>(filePath)));
        });

        // 3) Change notes to note items.
        const results = await Promise.all(readingNotes);
        const notes: NoteItem[] = results
            .filter(note => note !== null)
            .map((note: Note, index) => ({
                ...note,
                fileName: filteredNoteFileNames[index],
                filePath: path.resolve(notesDirPath, filteredNoteFileNames[index]),
                contentFilePath: note.label
                    ? path.resolve(
                        this.workspace.configs.rootDirPath,
                        note.label,
                        note.contentFileName,
                    )
                    : path.resolve(
                        this.workspace.configs.rootDirPath,
                        note.contentFileName,
                    ),
            }));

        // 4) Dispatch 'LOAD_COLLECTION_COMPLETE' action.
        this.store.dispatch(new LoadNoteCollectionCompleteAction({ notes }));
    }

    getFilteredAndSortedNoteList(): Observable<NoteItem[]> {
        return this.store.pipe(
            select(state => state.note.collection.filteredAndSortedNotes),
        );
    }

    getSelectedNote(): Observable<NoteItem | null> {
        return this.store.pipe(
            select(state => state.note.collection.selectedNote),
        );
    }

    getNoteVcsFileChanges(note: NoteItem): VcsFileChange[] {
        const { contentFilePath, filePath } = note;
        const matchedFilePaths = [contentFilePath, filePath];

        return this.vcsFileChanges.filter(change => matchedFilePaths.includes(change.absoluteFilePath));
    }

    getNoteVcsFileChangeStatus(note: NoteItem): VcsFileChangeStatusTypes | null {
        const fileChanges = this.getNoteVcsFileChanges(note);

        // TODO(@seokju-na): Currently, because note has 2 files, we cannot
        //  determine one status for one note.
        return fileChanges.length ? fileChanges[0].status : null;
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

        const contentRawValue = result.contentRawValue;
        const note: Note = {
            id,
            title,
            snippets: convertToNoteSnippets(result.parsedSnippets),
            createdDatetime: createdAt,
            stackIds: [],
            label: directory,
            contentFileName,
        };

        /**
         * Make sure to ensure the directory where content file will saved.
         */
        await toPromise(this.fs.ensureDirectory(path.dirname(contentFilePath)));
        await toPromise(zip(
            this.fs.writeJsonFile<Note>(noteFilePath, note),
            this.fs.writeFile(contentFilePath, contentRawValue),
        ));

        // Dispatch 'ADD_NOTE' action.
        const noteItem: NoteItem = {
            ...note,
            fileName: noteFileName,
            filePath: noteFilePath,
            contentFilePath,
        };

        this.store.dispatch(new AddNoteAction({ note: noteItem }));
    }

    async changeNoteTitle(noteItem: NoteItem, newTitle: string): Promise<void> {
        const dirName = path.dirname(noteItem.contentFilePath);
        let newContentFileName: string;
        let newContentFilePath: string;

        const allNotes = await toPromise(this.store.pipe(
            select(state => state.note.collection.notes),
            take(1),
        ));
        const allNoteContentFilePaths = allNotes.map(item => item.contentFilePath);

        let index = 0;
        const isNoteTitleDuplicated = title => allNoteContentFilePaths.includes(title);

        // Check title duplication.
        do {
            const title = index === 0 ? newTitle : `${newTitle}(${index})`;

            newContentFileName = makeNoteContentFileName(noteItem.createdDatetime, title);
            newContentFilePath = path.resolve(dirName, newContentFileName);
            index++;
        } while (isNoteTitleDuplicated(newContentFilePath));

        // If content file name is same, just ignore.
        if (newContentFileName === noteItem.contentFileName) {
            return;
        }

        // Rename file.
        try {
            await toPromise(this.fs.renameFile(noteItem.contentFilePath, newContentFilePath));
        } catch (error) {
            throw new NoteContentFileAlreadyExistsError();
        }

        this.store.dispatch(new ChangeNoteTitleAction({
            note: noteItem,
            title: newTitle,
            contentFileName: newContentFileName,
            contentFilePath: newContentFilePath,
        }));
    }

    changeNoteStacks(noteItem: NoteItem, stacks: string[]): void {
        this.store.dispatch(new ChangeNoteStacksAction({ note: noteItem, stacks }));
    }

    deleteNote(noteItem: NoteItem): void {
        const allRemoved = shell.moveItemToTrash(noteItem.filePath)
            && shell.moveItemToTrash(noteItem.contentFilePath);

        if (!allRemoved) {
            // TODO(@seokju-na): Might need rollback...?
            return;
        }

        this.getSelectedNote().pipe(take(1)).subscribe((selectedNote: NoteItem) => {
            if (selectedNote && selectedNote.id === noteItem.id) {
                this.store.dispatch(new DeselectNoteAction());
            }

            this.store.dispatch(new DeleteNoteAction({ note: noteItem }));
        });
    }

    private subscribeToggles(): void {
        this.toggleNoteSelectionSubscription =
            this._toggleNoteSelection.asObservable().pipe(
                switchMap(note =>
                    this.getSelectedNote().pipe(
                        take(1),
                        map(selectedNote => ([selectedNote, note])),
                    ),
                ),
            ).subscribe(([selectedNote, note]) =>
                this.handleNoteSelectionToggling(selectedNote, note),
            );
    }

    private handleNoteSelectionToggling(selectedNote: NoteItem, note: NoteItem): void {
        if (selectedNote && selectedNote.id === note.id) {
            this.deselectNote();
        } else {
            this.selectNote(note);
        }
    }
}
