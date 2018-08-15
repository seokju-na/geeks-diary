import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { NoteSnippetTypes } from '../../../models/note-snippet';
import { WorkspaceService } from '../../core/workspace.service';
import { NoteCollectionService } from '../shared/note-collection.service';
import { NoteEditorService, NoteSnippetEditorOutlet } from '../shared/note-editor.service';


@Component({
    selector: 'gd-note-editor',
    templateUrl: './note-editor.component.html',
    styleUrls: ['./note-editor.component.scss'],
})
export class NoteEditorComponent implements OnInit, AfterViewInit {
    readonly snippetTypes = NoteSnippetTypes;

    readonly snippetOutlets: Observable<NoteSnippetEditorOutlet[]> =
        this.editor.getOutlets();

    constructor(
        private workspace: WorkspaceService,
        private editor: NoteEditorService,
        private collection: NoteCollectionService,
    ) {
    }

    ngOnInit(): void {
        this.collection.load();
    }

    ngAfterViewInit(): void {
    }

}
