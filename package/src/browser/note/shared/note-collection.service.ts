import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as path from 'path';
import { toPromise } from '../../../libs/rx';
import { Note } from '../../../models/note';
import { FsService } from '../../core/fs.service';
import { WorkspaceService } from '../../core/workspace.service';
import { NoteModule } from '../note.module';
import { LoadNoteCollectionAction, LoadNoteCollectionCompleteAction } from './note-collection.actions';
import { getNoteLabel, NoteItem } from './note-item.model';
import { NoteParser } from './note-parser';
import { NoteStateWithRoot } from './note.state';


@Injectable({
    providedIn: NoteModule,
})
export class NoteCollectionService {
    constructor(
        private store: Store<NoteStateWithRoot>,
        private parser: NoteParser,
        private fs: FsService,
        private workspace: WorkspaceService,
    ) {
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

    getSelectedNote(): void {
    }

    toggleNoteSelection(): void {
    }

    selectNote(): void {
    }

    deselectNote(): void {
    }

    createNewNote(): void {
    }

    deleteNote(): void {
    }
}
