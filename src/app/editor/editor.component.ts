import { Component, OnInit } from '@angular/core';
import { EditorService } from './editor.service';
import { EditorSnippetRef } from './snippet/snippet';


@Component({
    selector: 'gd-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.less'],
})
export class EditorComponent implements OnInit {
    constructor(private editorService: EditorService) {
    }

    get snippetRefs(): EditorSnippetRef[] {
        return this.editorService.snippetRefs;
    }

    ngOnInit(): void {
    }
}
