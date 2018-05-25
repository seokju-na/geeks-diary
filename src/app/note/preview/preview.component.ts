import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as marked from 'marked';
import { Subscription } from 'rxjs';
import { NoteContent } from '../models';
import { NoteStateWithRoot } from '../reducers';


marked.setOptions({
    renderer: new marked.Renderer(),
    headerIds: false,
});


@Component({
    selector: 'gd-note-preview',
    templateUrl: './preview.component.html',
    styleUrls: ['./preview.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotePreviewComponent implements OnInit, OnDestroy {
    @ViewChild('content') contentEl: ElementRef;
    _parsedContent: string;

    private storeSubscription: Subscription;

    constructor(
        private store: Store<NoteStateWithRoot>,
    ) {
    }

    ngOnInit(): void {
        this.storeSubscription = this.store
            .pipe(select(state => state.note.editor))
            .subscribe((editorState) => {
                if (!editorState.loaded) {
                    return;
                }

                this._parsedContent = marked(
                    NoteContent.convertToPreviewString(editorState.selectedNoteContent));

                if (this.contentEl) {
                    this.contentEl.nativeElement.innerHTML = this._parsedContent;
                }
            });
    }

    ngOnDestroy(): void {
        if (this.storeSubscription) {
            this.storeSubscription.unsubscribe();
        }
    }
}
