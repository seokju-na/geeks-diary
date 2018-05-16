import { Component, OnInit } from '@angular/core';
import { NoteEditorService } from './editor.service';
import { NoteEditorSnippetRef } from './snippet/snippet';


@Component({
    selector: 'gd-note-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.less'],
})
export class NoteEditorComponent implements OnInit {
    constructor(private editorService: NoteEditorService) {
    }

    get snippetRefs(): NoteEditorSnippetRef[] {
        return this.editorService.snippetRefs;
    }

    ngOnInit(): void {
    }
}
