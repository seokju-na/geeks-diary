import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { NoteStateWithRoot } from '../reducers';
import { NoteEditorService } from './editor.service';
import { NoteEditorSnippetRef } from './snippet/snippet';


@Component({
    selector: 'gd-note-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.less'],
})
export class NoteEditorComponent implements OnInit {
    editorLoaded: Observable<boolean>;

    constructor(
        private editorService: NoteEditorService,
        private store: Store<NoteStateWithRoot>,
    ) {
    }

    get snippetRefs(): NoteEditorSnippetRef[] {
        return this.editorService.snippetRefs;
    }

    ngOnInit(): void {
        this.editorLoaded =
            this.store.pipe(select(state => state.note.editor.loaded));
    }
}
