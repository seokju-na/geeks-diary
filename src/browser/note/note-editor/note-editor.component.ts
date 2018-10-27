import { DOWN_ARROW, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { filter, withLatestFrom } from 'rxjs/operators';
import { NoteSnippetTypes } from '../../../core/note';
import { MenuEvent, MenuService } from '../../shared';
import { NoteStateWithRoot } from '../note.state';
import { NoteCodeSnippetActionDialog } from './note-code-snippet-action-dialog/note-code-snippet-action-dialog';
import { NoteEditorState } from './note-editor.state';
import { NoteSnippetEditorNewSnippetEvent } from './note-snippet-editor';
import { NoteSnippetListManager } from './note-snippet-list-manager';


@Component({
    selector: 'gd-note-editor',
    templateUrl: './note-editor.component.html',
    styleUrls: ['./note-editor.component.scss'],
})
export class NoteEditorComponent implements OnInit, OnDestroy {
    readonly titleInputControl = new FormControl('');

    @ViewChild('scrollable') scrollable: ElementRef<HTMLElement>;
    @ViewChild('snippetsList') snippetsList: ElementRef<HTMLElement>;
    @ViewChild('titleTextarea') titleTextarea: ElementRef<HTMLTextAreaElement>;

    private listTopFocusOutSubscription = Subscription.EMPTY;
    private menuMessageSubscription = Subscription.EMPTY;

    constructor(
        private snippetListManager: NoteSnippetListManager,
        public _viewContainerRef: ViewContainerRef,
        private menu: MenuService,
        private store: Store<NoteStateWithRoot>,
        private actionDialog: NoteCodeSnippetActionDialog,
    ) {
    }

    private get filteredMenuMessages(): Observable<MenuEvent> {
        return this.menu.onMessage().pipe(
            filter(event => [
                MenuEvent.NEW_CODE_SNIPPET,
                MenuEvent.NEW_TEXT_SNIPPET,
            ].includes(event)),
        );
    }

    ngOnInit(): void {
        this.snippetListManager
            .setContainerElement(this.snippetsList.nativeElement)
            .setViewContainerRef(this._viewContainerRef);

        this.listTopFocusOutSubscription = this.snippetListManager.topFocusOut()
            .subscribe(() => {
                if (this.titleTextarea) {
                    this.titleTextarea.nativeElement.focus();
                }
            });

        this.menuMessageSubscription = this.filteredMenuMessages.pipe(
            withLatestFrom(this.store.pipe(select(state => state.note.editor))),
        ).subscribe(([event, editorState]) => {
            const { activeSnippetIndex } = editorState as NoteEditorState;

            if (activeSnippetIndex === null) {
                return;
            }

            const ref = this.snippetListManager.getSnippetRefByIndex(activeSnippetIndex);

            // If snippet is not exists, just ignore.
            if (!ref) {
                return;
            }

            switch (event as MenuEvent) {
                case MenuEvent.NEW_TEXT_SNIPPET:
                    this.snippetListManager.handleSnippetRefEvents(new NoteSnippetEditorNewSnippetEvent(
                        ref,
                        {
                            snippet: {
                                type: NoteSnippetTypes.TEXT,
                                value: '',
                            },
                        },
                    ));
                    break;
                case MenuEvent.NEW_CODE_SNIPPET:
                    this.actionDialog.open({ actionType: 'create' }).afterClosed().subscribe((result) => {
                        if (result) {
                            this.snippetListManager.handleSnippetRefEvents(new NoteSnippetEditorNewSnippetEvent(
                                ref,
                                {
                                    snippet: {
                                        type: NoteSnippetTypes.CODE,
                                        value: '',
                                        codeLanguageId: result.codeLanguageId,
                                        codeFileName: result.codeFileName,
                                    },
                                },
                            ));
                        }
                    });
                    break;
            }
        });
    }

    ngOnDestroy(): void {
        this.listTopFocusOutSubscription.unsubscribe();
        this.menuMessageSubscription.unsubscribe();
    }

    moveFocusToSnippetEditor(event: KeyboardEvent): void {
        const { keyCode } = event;

        if (keyCode === DOWN_ARROW || keyCode === ENTER) {
            event.preventDefault();
            this.snippetListManager.focusTo(0);
        }
    }
}
