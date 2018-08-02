import { AfterViewInit, Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Observable } from 'rxjs';
import { NoteSnippetTypes } from '../../../models/note-snippet';
import { WorkspaceService } from '../../core/workspace.service';
import { NoteSnippetEditor } from '../note-snippet-editors/note-snippet-editor';
import { NoteCollectionService } from '../shared/note-collection.service';
import { NoteSnippetContent } from '../shared/note-content.model';
import { NoteEditorService, NoteSnippetEditorOutlet } from '../shared/note-editor.service';


@Component({
    selector: 'gd-note-editor',
    templateUrl: './note-editor.component.html',
    styleUrls: ['./note-editor.component.scss'],
})
export class NoteEditorComponent implements OnInit, AfterViewInit {
    readonly content1: NoteSnippetContent = {
        type: NoteSnippetTypes.TEXT,
        value: 'Hello World!',
    };

    readonly content2: NoteSnippetContent = {
        type: NoteSnippetTypes.CODE,
        value: 'function helloWorld(): void;',
        codeLanguageId: 'typescript',
        codeFileName: 'abc.ts',
    };

    @ViewChildren('snippet', { read: NoteSnippetEditor })
    snippetEditors: QueryList<NoteSnippetEditor>;

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
        this.editor.initSnippetEditors(this.snippetEditors);
    }

}
