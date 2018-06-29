import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
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
import { Subscription } from 'rxjs';
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
    noteTitle = '';
    editorLoaded = false;
    _parsedContent: string;

    private storeSubscription: Subscription;

    constructor(
        private store: Store<NoteStateWithRoot>,
        private changeDetector: ChangeDetectorRef,
    ) {
    }

    ngOnInit(): void {
        this.storeSubscription = this.store
            .pipe(select(state => state.note.editor))
            .subscribe((editorState) => {
                this.editorLoaded = editorState.loaded;

                if (this.editorLoaded) {
                    this.noteTitle = editorState.selectedNoteContent.title;
                    this.parseContent(editorState.selectedNoteContent);
                } else {
                    this.removeContent();
                }

                this.changeDetector.detectChanges();
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
