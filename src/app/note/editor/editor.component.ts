import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { UpdateTitleAction } from '../actions';
import { NoteStateWithRoot } from '../reducers';
import {
    NoteEditorExtraEvent,
    NoteEditorExtraEventNames,
    NoteEditorService,
} from './editor.service';
import { NoteEditorSnippetRef } from './snippet/snippet';


@Component({
    selector: 'gd-note-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.less'],
})
export class NoteEditorComponent implements OnInit, OnDestroy {
    @Input() readonly layoutUpdated: Observable<void>;

    editorLoaded: Observable<boolean>;
    titleInputControl = new FormControl('');

    @ViewChild('titleTextarea') titleTextareaEl: ElementRef;

    private titleChangesViaUserInputSubscription: Subscription;
    private titleChangesFromStoreSubscription: Subscription;
    private extraEventsSubscription: Subscription;
    private layoutUpdatesSubscription: Subscription;

    constructor(
        private editorService: NoteEditorService,
        private store: Store<NoteStateWithRoot>,
        private changeDetector: ChangeDetectorRef,
    ) {
    }

    get snippetRefs(): NoteEditorSnippetRef[] {
        return this.editorService.snippetRefs;
    }

    ngOnInit(): void {
        this.editorLoaded =
            this.store.pipe(select(state => state.note.editor.loaded));

        this.titleChangesViaUserInputSubscription =
            this.titleInputControl.valueChanges
                .subscribe((value) => {
                    this.handleTitleChangesViaUserInput(value);
                });

        this.titleChangesFromStoreSubscription =
            this.store
                .pipe(select(state => state.note.editor))
                .subscribe((editorState) => {
                    if (editorState.loaded) {
                        this.handleTitleChangesFromStore(editorState.selectedNoteContent.title);
                    }
                });

        this.extraEventsSubscription =
            this.editorService.events().subscribe((event) => {
                this.handleExtraEvents(event);
            });

        this.layoutUpdatesSubscription =
            this.layoutUpdated.subscribe(() => {
                setTimeout(() => {
                    this.editorService.updateLayout();
                });
            });
    }

    ngOnDestroy(): void {
        if (this.titleChangesViaUserInputSubscription) {
            this.titleChangesViaUserInputSubscription.unsubscribe();
        }

        if (this.titleChangesFromStoreSubscription) {
            this.titleChangesFromStoreSubscription.unsubscribe();
        }

        if (this.extraEventsSubscription) {
            this.extraEventsSubscription.unsubscribe();
        }

        if (this.layoutUpdatesSubscription) {
            this.layoutUpdatesSubscription.unsubscribe();
        }
    }

    moveFocusToSnippetEditor(event: KeyboardEvent): void {
        event.preventDefault();
        this.editorService.setFocusByIndex(0);
    }

    private handleTitleChangesViaUserInput(title: string): void {
        this.store.dispatch(new UpdateTitleAction({ title }));
    }

    private handleTitleChangesFromStore(title: string): void {
        if (title !== this.titleInputControl.value) {
            this.titleInputControl.setValue(title, { emitEvent: false });
        }
    }

    private handleExtraEvents(event: NoteEditorExtraEvent): void {
        switch (event.name) {
            // Detect changes for node 'fs' process.
            case NoteEditorExtraEventNames.INIT:
                this.changeDetector.detectChanges();
                break;

            case NoteEditorExtraEventNames.MOVE_FOCUS_OUT_OF_SNIPPETS:
                if (event.payload.direction === -1) {
                    this.titleTextareaEl.nativeElement.focus();
                }
                break;
        }
    }
}
