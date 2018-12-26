import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { shell } from 'electron';
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
export class NotePreviewComponent implements OnInit, OnDestroy {
    @ViewChild('scrollable') scrollable: ElementRef<HTMLElement>;
    @ViewChild('content') content: ElementRef<HTMLElement>;

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

    private anchorEventListeners = new Map<HTMLElement, any>();

    constructor(
        private store: Store<NoteStateWithRoot>,
    ) {
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        this.clearAnchorEventListeners();
    }

    patchAnchors(): void {
        this.clearAnchorEventListeners();

        const anchors = this.content.nativeElement.querySelectorAll('a');

        for (let i = 0; i < anchors.length; i++) {
            const anchor = anchors.item(i);
            const href = anchor.getAttribute('href');

            anchor.removeAttribute('href');

            if (href !== null) {
                const listener = (event: Event) => {
                    event.preventDefault();
                    shell.openExternal(href);
                };

                anchor.addEventListener('click', listener);
                this.anchorEventListeners.set(anchor, listener);
            }
        }
    }

    private clearAnchorEventListeners(): void {
        this.anchorEventListeners.forEach((listener, elem) => {
            elem.removeEventListener('click', listener);
        });

        this.anchorEventListeners.clear();
    }
}
