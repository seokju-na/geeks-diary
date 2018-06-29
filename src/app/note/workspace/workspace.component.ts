import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { merge } from 'rxjs/observable/merge';
import { debounceTime, mapTo, share } from 'rxjs/operators';
import { NoteEditorViewModes } from '../models';
import { NoteStateWithRoot } from '../reducers';


@Component({
    selector: 'gd-note-workspace',
    templateUrl: './workspace.component.html',
    styleUrls: ['./workspace.component.less'],
})
export class NoteWorkspaceComponent implements OnInit, OnDestroy {
    editorViewMode: Observable<NoteEditorViewModes>;

    VIEW_EDITOR_ONLY_MODE = NoteEditorViewModes.EDITOR_ONLY;
    VIEW_PREVIEW_ONLY_MODE = NoteEditorViewModes.PREVIEW_ONLY;

    editorLoaded = false;
    layoutUpdateActions: Observable<void>;

    private editorLoadedSubscription: Subscription;

    constructor(
        private store: Store<NoteStateWithRoot>,
        private changeDetector: ChangeDetectorRef,
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
    }

    ngOnInit(): void {
        this.editorLoadedSubscription = this.store
            .pipe(select(state => state.note.editor.loaded))
            .subscribe((value) => {
                this.editorLoaded = value;
                this.changeDetector.detectChanges();
            });
    }

    ngOnDestroy(): void {
        if (this.editorLoadedSubscription) {
            this.editorLoadedSubscription.unsubscribe();
        }
    }
}
