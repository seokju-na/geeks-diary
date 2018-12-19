import { COMMA, DOWN_ARROW, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { from, Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, debounceTime, filter, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { AssetTypes } from '../../../core/asset';
import { NoteSnippetTypes } from '../../../core/note';
import { toPromise } from '../../../libs/rx';
import { MenuEvent, MenuService, NativeDialog, nativeDialogFileFilters, NativeDialogProperties } from '../../shared';
import { ConfirmDialog } from '../../shared/confirm-dialog';
import { Stack, StackViewer } from '../../stack';
import { AutocompleteTriggerDirective } from '../../ui/autocomplete';
import { ChipInputEvent } from '../../ui/chips';
import { NoteCollectionService } from '../note-collection';
import { NoteContentFileAlreadyExistsError } from '../note-errors';
import { NoteStateWithRoot } from '../note.state';
import { NoteCodeSnippetActionDialog } from './note-code-snippet-action-dialog/note-code-snippet-action-dialog';
import { NoteSnippetContent } from './note-content.model';
import { NoteEditorService } from './note-editor.service';
import { NoteEditorState } from './note-editor.state';
import {
    NoteSnippetEditorInsertImageEvent,
    NoteSnippetEditorNewSnippetEvent,
    NoteSnippetEditorRef,
} from './note-snippet-editor';
import { NoteSnippetListManager } from './note-snippet-list-manager';


@Component({
    selector: 'gd-note-editor',
    templateUrl: './note-editor.component.html',
    styleUrls: ['./note-editor.component.scss'],
    host: {
        'class': 'NoteEditor',
    },
})
export class NoteEditorComponent implements OnInit, OnDestroy {
    private get filteredMenuMessages(): Observable<MenuEvent> {
        return this.menu.onMessage().pipe(
            filter(event => [
                MenuEvent.NEW_CODE_SNIPPET,
                MenuEvent.NEW_TEXT_SNIPPET,
                MenuEvent.INSERT_IMAGE,
            ].includes(event)),
        );
    }

    searchedStacks: Stack[] = [];
    stacks: Stack[] = [];

    readonly stacksChanged = new Subject<Stack[]>();
    readonly stackInputControl = new FormControl('');
    readonly stackSearchControl = new FormControl('');
    readonly stackInputSeparatorKeyCodes = [ENTER, COMMA];

    readonly titleInputControl = new FormControl('');

    @ViewChild('scrollable') scrollable: ElementRef<HTMLElement>;
    @ViewChild('snippetsList') snippetsList: ElementRef<HTMLElement>;
    @ViewChild('titleTextarea') titleTextarea: ElementRef<HTMLTextAreaElement>;
    @ViewChild('stackAutoTrigger') stackAutocompleteTrigger: AutocompleteTriggerDirective;

    private listTopFocusOutSubscription = Subscription.EMPTY;
    private menuMessageSubscription = Subscription.EMPTY;
    private selectedNoteChangedSubscription = Subscription.EMPTY;

    private titleChangesSubscription = Subscription.EMPTY;
    private stacksChangesSubscription = Subscription.EMPTY;
    private stackAutocompleteSearchSubscription = Subscription.EMPTY;

    constructor(
        private snippetListManager: NoteSnippetListManager,
        public _viewContainerRef: ViewContainerRef,
        private menu: MenuService,
        private store: Store<NoteStateWithRoot>,
        private actionDialog: NoteCodeSnippetActionDialog,
        private nativeDialog: NativeDialog,
        private editorService: NoteEditorService,
        private collectionService: NoteCollectionService,
        private confirmDialog: ConfirmDialog,
        private stackViewer: StackViewer,
    ) {
    }

    get stackNames(): string[] {
        return this.stacks.map(stack => stack.name);
    }

    ngOnInit(): void {
        this.snippetListManager
            .setContainerElement(this.snippetsList.nativeElement)
            .setViewContainerRef(this._viewContainerRef);

        this.subscribeListTopFocusOut();
        this.subscribeMenuMessage();
        this.subscribeSelectedNoteChanged();
        this.subscribeStackAutocompleteSearch();
        this.subscribeStacksChanges();
        this.subscribeTitleChanges();
    }

    ngOnDestroy(): void {
        this.listTopFocusOutSubscription.unsubscribe();
        this.menuMessageSubscription.unsubscribe();
        this.selectedNoteChangedSubscription.unsubscribe();
        this.titleChangesSubscription.unsubscribe();
        this.stacksChangesSubscription.unsubscribe();
        this.stackAutocompleteSearchSubscription.unsubscribe();
    }

    moveFocusToSnippetEditor(event: KeyboardEvent): void {
        const { keyCode } = event;

        if (keyCode === DOWN_ARROW || keyCode === ENTER) {
            event.preventDefault();
            this.snippetListManager.focusTo(0);
        }
    }

    addStack(event: ChipInputEvent): void {
        const name = event.value;
        const stack = this.stackViewer.getStackWithSafe(name);

        if (!this.stacks.some(s => s.name === name)) {
            this.stacks.push(stack);
            this.stacksChanged.next(this.stacks);
        }

        this.stackSearchControl.patchValue('');
    }

    removeStack(stack: Stack): void {
        const index = this.stacks.findIndex(s => s.name === stack.name);

        if (index !== -1) {
            this.stacks.splice(index, 1);
            this.stacksChanged.next(this.stacks);

            // Close panel is expected behavior.
            this.stackAutocompleteTrigger.closePanel();
        }
    }

    private createNewTextSnippet(ref: NoteSnippetEditorRef<any>): void {
        const snippet: NoteSnippetContent = {
            type: NoteSnippetTypes.TEXT,
            value: '',
        };
        const event = new NoteSnippetEditorNewSnippetEvent(ref, { snippet });

        this.snippetListManager.handleSnippetRefEvent(event);
    }

    private createNewCodeSnippet(ref: NoteSnippetEditorRef<any>): void {
        this.actionDialog.open({ actionType: 'create' }).afterClosed().subscribe((result) => {
            if (result) {
                const snippet: NoteSnippetContent = {
                    type: NoteSnippetTypes.CODE,
                    value: '',
                    codeLanguageId: result.codeLanguageId,
                    codeFileName: result.codeFileName,
                };
                const event = new NoteSnippetEditorNewSnippetEvent(ref, { snippet });

                this.snippetListManager.handleSnippetRefEvent(event);
            }
        });
    }

    private async insertImageAtSnippet(ref: NoteSnippetEditorRef<any>): Promise<void> {
        if (ref._config.type !== NoteSnippetTypes.TEXT) {
            return;
        }

        const result = await toPromise(this.nativeDialog.showOpenDialog({
            message: 'Choose an image:',
            properties: NativeDialogProperties.OPEN_FILE,
            fileFilters: [nativeDialogFileFilters.IMAGES],
        }));

        if (!result.isSelected) {
            return;
        }

        const currentSelectedNote = await toPromise(
            this.collectionService.getSelectedNote().pipe(take(1)),
        );

        if (!currentSelectedNote) {
            return;
        }

        const { contentFilePath } = currentSelectedNote;
        const asset = await toPromise(this.editorService.copyAssetFile(
            AssetTypes.IMAGE,
            contentFilePath,
            result.filePaths[0],
        ));

        if (asset) {
            const event = new NoteSnippetEditorInsertImageEvent(ref, {
                fileName: asset.fileNameWithoutExtension,
                filePath: asset.relativePathToWorkspaceDir,
            });

            this.snippetListManager.handleSnippetRefEvent(event);
        }
    }

    private handleNoteTitleChangeError(error: Error, titleToChange: string): void {
        let message: string;

        if (error instanceof NoteContentFileAlreadyExistsError) {
            message = `Note file with the same file already exists. Please use a different title.`;
        } else {
            message = error && error.message ? error.message : 'Unknown Error';
        }

        // FIXME LATER: I think this is not good handling. We need to think about UX.
        this.confirmDialog.open({
            isAlert: true,
            title: `Cannot update note title to: "${titleToChange}"`,
            body: message,
        });
    }

    private subscribeListTopFocusOut(): void {
        this.listTopFocusOutSubscription = this.snippetListManager.topFocusOut()
            .subscribe(() => {
                if (this.titleTextarea) {
                    this.titleTextarea.nativeElement.focus();
                }
            });
    }

    private subscribeMenuMessage(): void {
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
                    this.createNewTextSnippet(ref);
                    break;

                case MenuEvent.NEW_CODE_SNIPPET:
                    this.createNewCodeSnippet(ref);
                    break;

                case MenuEvent.INSERT_IMAGE:
                    this.insertImageAtSnippet(ref);
                    break;
            }
        });
    }

    private subscribeSelectedNoteChanged(): void {
        this.selectedNoteChangedSubscription = this.collectionService.getSelectedNote()
            .subscribe((note) => {
                if (note) {
                    this.titleInputControl.setValue(note.title, { emitEvent: false });
                    this.stacks = note.stackIds.map(name => this.stackViewer.getStackWithSafe(name));
                }
            });
    }

    private subscribeTitleChanges(): void {
        this.titleChangesSubscription = this.titleInputControl.valueChanges.pipe(
            debounceTime(250),
            withLatestFrom(this.collectionService.getSelectedNote()),
            switchMap(([newTitle, note]) =>
                from(this.collectionService.changeNoteTitle(note, newTitle)).pipe(
                    catchError((error) => {
                        this.handleNoteTitleChangeError(error, newTitle);
                        return of(null);
                    }),
                ),
            ),
        ).subscribe();
    }

    private subscribeStacksChanges(): void {
        this.stacksChangesSubscription = this.stacksChanged.pipe(
            debounceTime(250),
            withLatestFrom(this.collectionService.getSelectedNote()),
            tap(([stacks, note]) =>
                this.collectionService.changeNoteStacks(note, stacks.map(stack => stack.name)),
            ),
        ).subscribe();
    }

    private subscribeStackAutocompleteSearch(): void {
        this.stackAutocompleteSearchSubscription = this.stackSearchControl.valueChanges
            .pipe(debounceTime(50))
            .subscribe((value) => {
                this.searchedStacks = this.stackViewer
                    .search(value as string)
                    .filter(stack => !this.stackNames.includes(stack.name));
            });
    }
}
