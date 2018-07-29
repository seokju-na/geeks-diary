import { Component, OnInit } from '@angular/core';
import { WorkspaceService } from '../../core/workspace.service';
import { NoteCollectionService } from '../shared/note-collection.service';


@Component({
    selector: 'gd-note-editor',
    templateUrl: './note-editor.component.html',
    styleUrls: ['./note-editor.component.scss'],
})
export class NoteEditorComponent implements OnInit {

    constructor(
        private workspace: WorkspaceService,
        private collection: NoteCollectionService,
    ) {
    }

    ngOnInit(): void {
        this.collection.load();
    }

}
