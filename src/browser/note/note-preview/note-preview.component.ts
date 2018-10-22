import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { NoteSnippetTypes } from '../../../core/note';
import { NoteSnippetContent } from '../note-editor';
import { NoteStateWithRoot } from '../note.state';


@Component({
    selector: 'gd-note-preview',
    templateUrl: './note-preview.component.html',
    styleUrls: ['./note-preview.component.scss'],
})
export class NotePreviewComponent implements OnInit {
    @ViewChild('scrollable') scrollable: ElementRef<HTMLElement>;

    readonly noteTitle: Observable<string> = this.store.pipe(
        filter(state => state.note.collection.loaded),
        filter(state => !!state.note.collection.selectedNote),
        select(state => state.note.collection.selectedNote.title),
    );

    readonly noteSnippets: Observable<NoteSnippetContent[]> = this.store.pipe(
        filter(state => state.note.editor.loaded),
        select(state => state.note.editor.selectedNoteContent.snippets),
    );

    readonly noteSnippetTypes = NoteSnippetTypes;

    constructor(
        private store: Store<NoteStateWithRoot>,
    ) {
    }

    ngOnInit(): void {
    }

}
