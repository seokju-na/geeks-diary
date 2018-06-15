import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { highlightAuto } from 'highlight.js';
import * as marked from 'marked';
import { Observable, Subscription } from 'rxjs';
import { filter, map, share } from 'rxjs/operators';
import { NoteContent } from '../models';
import { NoteStateWithRoot } from '../reducers';


marked.setOptions({
    renderer: new marked.Renderer(),
    headerIds: false,
    highlight(code: any): string {
        return highlightAuto(code).value;
    },
});


@Component({
    selector: 'gd-note-preview',
    templateUrl: './preview.component.html',
    styleUrls: ['./preview.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class NotePreviewComponent implements OnInit, OnDestroy {
    @ViewChild('content') contentEl: ElementRef;
    noteTitle: Observable<string>;
    editorLoaded: Observable<boolean>;
    _parsedContent: string;

    private storeSubscription: Subscription;

    constructor(
        private store: Store<NoteStateWithRoot>,
    ) {
    }

    ngOnInit(): void {
        this.editorLoaded = this.store.pipe(
            select(state => state.note.editor),
            map(editorState => editorState.loaded),
            share(),
        );

        this.noteTitle = this.store.pipe(
            select(state => state.note.editor),
            filter(editorState => editorState.loaded),
            map(editorState => editorState.selectedNoteContent.title),
        );

        this.storeSubscription = this.store
            .pipe(
                select(state => state.note.editor),
            )
            .subscribe((editorState) => {
                if (editorState.loaded) {
                    this.parseContent(editorState.selectedNoteContent);
                } else {
                    this.removeContent();
                }
            });
    }

    ngOnDestroy(): void {
        if (this.storeSubscription) {
            this.storeSubscription.unsubscribe();
        }
    }

    private parseContent(content: NoteContent): void {
        this._parsedContent = marked(
            NoteContent.convertToPreviewString(content));

        if (this.contentEl) {
            this.contentEl.nativeElement.innerHTML = this._parsedContent;
        }
    }

    private removeContent(): void {
        if (this.contentEl) {
            this.contentEl.nativeElement.innerHTML = '';
        }
    }
}
