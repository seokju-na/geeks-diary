import { Injectable } from '@angular/core';
import { Sorting } from '../../../models/sorting';


export class NoteCollectionGetListOptions {
    applyFilter?: boolean = true;
    applySort?: boolean = true;
}


@Injectable({
    providedIn: 'root',
})
export class NoteCollectionService {
    private sorting = new Sorting();

    async load(): Promise<void> {
        // Load files
    }

    getNoteList(options: NoteCollectionGetListOptions = {}): void {
        const _options = {
            ...(new NoteCollectionGetListOptions()),
            ...options,
        };
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
