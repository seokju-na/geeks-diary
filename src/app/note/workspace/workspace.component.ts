import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { merge } from 'rxjs/observable/merge';
import { debounceTime, mapTo, share } from 'rxjs/operators';
import { AddNoteAction } from '../actions';
import { NoteEditorViewModes } from '../models';
import { NoteStateWithRoot } from '../reducers';
import { NoteProduceService } from '../shared/note-produce.service';


@Component({
    selector: 'gd-note-workspace',
    templateUrl: './workspace.component.html',
    styleUrls: ['./workspace.component.less'],
})
export class NoteWorkspaceComponent implements OnInit {
    editorViewMode: Observable<NoteEditorViewModes>;

    VIEW_EDITOR_ONLY_MODE = NoteEditorViewModes.EDITOR_ONLY;
    VIEW_PREVIEW_ONLY_MODE = NoteEditorViewModes.PREVIEW_ONLY;

    editorLoaded: Observable<boolean>;

    readonly layoutUpdateActions: Observable<void>;

    constructor(
        private store: Store<NoteStateWithRoot>,
        private noteProduceService: NoteProduceService,
    ) {

        this.editorViewMode = this.store.pipe(
            select(state => state.note.editor.viewMode),
            share(),
        );

        this.layoutUpdateActions = merge(
            fromEvent(<any>window, 'resize'),
            this.editorViewMode,
        ).pipe(
            debounceTime(50),
            mapTo(null),
        );

        this.editorLoaded = this.store.pipe(
            select(state => state.note.editor.loaded),
        );
    }

    ngOnInit(): void {
    }

    addNewNote(): void {
        const action = new AddNoteAction(this.noteProduceService.createNewNote());

        this.store.dispatch(action);
    }
}
