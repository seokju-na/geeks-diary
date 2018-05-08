import { Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { NoteMetadata } from '../models';
import { NoteStateWithRoot } from '../reducers';


interface NoteHeaderToolItem {
    name: string;
    description: string;
    iconName: string;
}


@Component({
    selector: 'gd-note-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.less'],
})
export class NoteHeaderComponent {
    toolItems: NoteHeaderToolItem[] = [
        { name: 'deleteNote', description: 'Delete note', iconName: 'trash-o' },
        { name: 'editorView', description: 'Switch editor view', iconName: 'eye' },
        { name: 'noteInfo', description: 'Show note info', iconName: 'info-circle' },
    ];
    selectedNote: Observable<NoteMetadata>;

    constructor(private store: Store<NoteStateWithRoot>) {
        this.selectedNote = this.store.pipe(
            select(state => state.note.collection.selectedNote));
    }
}
