import { Component } from '@angular/core';
import { NoteEditorService } from './editor.service';
import { NoteEditorSnippetRef } from './snippets/snippet';


@Component({
    selector: 'gd-note-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.less'],
})
export class NoteEditorComponent {
    constructor(private editorService: NoteEditorService) {
    }

    get snippets(): NoteEditorSnippetRef[] {
        return this.editorService.snippets;
    }
}
