import { COMMA, DOWN_ARROW, ENTER } from '@angular/cdk/keycodes';
import { DebugElement } from '@angular/core';
import { ComponentFixture, discardPeriodicTasks, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { of, ReplaySubject, Subject } from 'rxjs';
import {
    createDummies,
    dispatchKeyboardEvent,
    expectDom,
    fastTestSetup,
    sample,
    typeInElement,
} from '../../../../test/helpers';
import { MockDialog } from '../../../../test/mocks/browser';
import { Asset, AssetTypes } from '../../../core/asset';
import { NoteSnippetTypes } from '../../../core/note';
import {
    MenuEvent,
    MenuService,
    NativeDialog,
    NativeDialogConfig,
    nativeDialogFileFilters,
    NativeDialogOpenResult,
    NativeDialogProperties,
    SharedModule,
} from '../../shared';
import { Stack, StackModule, StackViewer } from '../../stack';
import { StackDummy } from '../../stack/dummies';
import { ChipDirective } from '../../ui/chips';
import { Dialog } from '../../ui/dialog';
import { UiModule } from '../../ui/ui.module';
import { NoteCollectionService, NoteItem, SelectNoteAction } from '../note-collection';
import { NoteItemDummy } from '../note-collection/dummies';
import { NoteSharedModule } from '../note-shared';
import { noteReducerMap } from '../note.reducer';
import { NoteStateWithRoot } from '../note.state';
import { NoteContentDummy, NoteSnippetContentDummy } from './dummies';
import {
    NoteCodeSnippetActionDialogActionType,
    NoteCodeSnippetActionDialogData,
} from './note-code-snippet-action-dialog/note-code-snippet-action-dialog-data';
import { NoteCodeSnippetActionDialogResult } from './note-code-snippet-action-dialog/note-code-snippet-action-dialog-result';
import { NoteCodeSnippetActionDialogComponent } from './note-code-snippet-action-dialog/note-code-snippet-action-dialog.component';
import { NoteContent, NoteSnippetContent } from './note-content.model';
import { BlurSnippetAction, FocusSnippetAction, LoadNoteContentCompleteAction } from './note-editor.actions';
import { NoteEditorComponent } from './note-editor.component';
import { NoteEditorModule } from './note-editor.module';
import { NoteEditorService } from './note-editor.service';
import { NoteSnippetEditorInsertImageEvent, NoteSnippetEditorNewSnippetEvent } from './note-snippet-editor';
import { NoteSnippetListManager } from './note-snippet-list-manager';
import Spy = jasmine.Spy;


describe('browser.note.noteEditor.NoteEditorComponent', () => {
    let fixture: ComponentFixture<NoteEditorComponent>;
    let component: NoteEditorComponent;

    let store: Store<NoteStateWithRoot>;
    let listManager: NoteSnippetListManager;
    let menu: MenuService;
    let mockDialog: MockDialog;
    let nativeDialog: NativeDialog;
    let noteEditor: NoteEditorService;
    let collection: NoteCollectionService;
    let stackViewer: StackViewer;

    let menuMessages: Subject<MenuEvent>;
    let selectedNoteStream: ReplaySubject<NoteItem>;

    const noteDummy = new NoteItemDummy();
    const contentDummy = new NoteContentDummy();
    const stackDummy = new StackDummy();

    const getTitleTextareaEl = (): HTMLTextAreaElement =>
        fixture.debugElement.query(
            By.css('.NoteEditor__titleTextarea > textarea'),
        ).nativeElement as HTMLTextAreaElement;

    const getStackChipDeList = (): DebugElement[] =>
        fixture.debugElement.queryAll(By.css('.NoteEditor__stackChip'));

    const getNoteStacksInputEl = (): HTMLInputElement =>
        fixture.debugElement.query(By.css('#note-stacks-input')).nativeElement as HTMLInputElement;

    function ensureSelectNoteAndLoadNoteContent(
        note: NoteItem = noteDummy.create(),
        content: NoteContent = contentDummy.create(),
    ): [NoteItem, NoteContent] {
        store.dispatch(new SelectNoteAction({ note }));
        store.dispatch(new LoadNoteContentCompleteAction({ note, content }));
        fixture.detectChanges();

        listManager.addAllSnippetsFromContent(content);
        selectedNoteStream.next(note);
        fixture.detectChanges();

        return [note, content];
    }

    function provideStackDummies(
        stacks: Stack[] = createDummies(stackDummy, 5),
    ): Stack[] {
        // Remove all stacks.
        while (stackViewer.stacks.length > 0) {
            stackViewer.stacks.pop();
        }

        stackViewer.stacks.push(...stacks);

        return stacks;
    }

    function activateSnippetAtIndex(index: number): void {
        store.dispatch(new FocusSnippetAction({ index }));
    }

    function deactivateSnippet(): void {
        store.dispatch(new BlurSnippetAction());
    }

    function ignoreStackSearchAutocomplete(): void {
        component['subscribeStackAutocompleteSearch'] = jasmine.createSpy('subscribeStackAutocompleteSearch spy');
    }

    fastTestSetup();

    beforeAll(async () => {
        menu = jasmine.createSpyObj('menu', [
            'onMessage',
        ]);

        collection = jasmine.createSpyObj('collection', [
            'changeNoteTitle',
            'getSelectedNote',
            'changeNoteStacks',
        ]);

        await TestBed
            .configureTestingModule({
                imports: [
                    NoopAnimationsModule,
                    UiModule,
                    SharedModule,
                    StoreModule.forRoot({
                        note: combineReducers(noteReducerMap),
                    }),
                    StackModule,
                    NoteSharedModule,
                    NoteEditorModule,
                    ...MockDialog.imports(),
                ],
                providers: [
                    { provide: MenuService, useValue: menu },
                    { provide: NoteCollectionService, useValue: collection },
                    ...MockDialog.providers(),
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        store = TestBed.get(Store);
        listManager = TestBed.get(NoteSnippetListManager);
        mockDialog = TestBed.get(Dialog);
        nativeDialog = TestBed.get(NativeDialog);
        noteEditor = TestBed.get(NoteEditorService);
        stackViewer = TestBed.get(StackViewer);

        menuMessages = new Subject<MenuEvent>();
        selectedNoteStream = new ReplaySubject<NoteItem>(1);

        (menu.onMessage as Spy).and.returnValue(menuMessages.asObservable());
        spyOn(listManager, 'handleSnippetRefEvent').and.callThrough();
        (collection.getSelectedNote as Spy).and.callFake(() => selectedNoteStream.asObservable());

        fixture = TestBed.createComponent(NoteEditorComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        menuMessages.complete();
        mockDialog.closeAll();
    });

    describe('stack input', () => {
        beforeEach(() => {
            ignoreStackSearchAutocomplete();
        });

        it('should show chips which from note stacks when ngOnInit.', () => {
            const selectedNote = noteDummy.create();
            const stacks = provideStackDummies();
            const noteStack = sample(stacks);

            selectedNote.stackIds.push(noteStack.name);

            ensureSelectNoteAndLoadNoteContent(selectedNote);

            const chipDeList = getStackChipDeList();
            expect(chipDeList.length).toEqual(1);

            // Chip value must be stack name.
            const chipInstance = chipDeList[0].injector.get<ChipDirective>(ChipDirective);
            expect(chipInstance.value).toEqual(noteStack.name);

            // Chip name must be shown.
            expectDom(chipDeList[0].nativeElement as HTMLElement).toContainText(noteStack.name);
        });

        it('should call \'changeNoteStacks\' from collection service when stack has been '
            + 'added with ENTER keydown. (debounceTime=250ms)', fakeAsync(() => {
            const stacks = provideStackDummies();
            const [selectedNote] = ensureSelectNoteAndLoadNoteContent();

            const stack = sample(stacks);
            const stacksInputEl = getNoteStacksInputEl();

            typeInElement(stack.name, getNoteStacksInputEl());
            dispatchKeyboardEvent(stacksInputEl, 'keydown', ENTER);
            fixture.detectChanges();
            tick(250);

            expect(collection.changeNoteStacks).toHaveBeenCalledWith(selectedNote, [stack.name]);
        }));

        it('should call \'changeNoteStacks\' from collection service when stack has been '
            + 'added with COMMA keydown. (debounceTime=250ms)', fakeAsync(() => {
            ignoreStackSearchAutocomplete();

            const stacks = provideStackDummies();
            const [selectedNote] = ensureSelectNoteAndLoadNoteContent();

            const stack = sample(stacks);
            const stacksInputEl = getNoteStacksInputEl();

            typeInElement(stack.name, getNoteStacksInputEl());
            dispatchKeyboardEvent(stacksInputEl, 'keydown', COMMA);
            fixture.detectChanges();
            tick(250);

            expect(collection.changeNoteStacks).toHaveBeenCalledWith(selectedNote, [stack.name]);
        }));

        it('should call \'changeNoteStacks\' from collection service when stack has been '
            + 'removed. (debounceTime=250ms)', fakeAsync(() => {
            ignoreStackSearchAutocomplete();

            const stacks = provideStackDummies();
            const [selectedNote] = ensureSelectNoteAndLoadNoteContent();

            const prevStack = sample(stacks);
            const stacksInputEl = getNoteStacksInputEl();

            // Add stack
            typeInElement(prevStack.name, getNoteStacksInputEl());
            dispatchKeyboardEvent(stacksInputEl, 'keydown', COMMA);
            fixture.detectChanges();
            tick(250);

            expect(collection.changeNoteStacks).toHaveBeenCalledWith(selectedNote, [prevStack.name]);

            // Remove stack
            getStackChipDeList()[0].injector
                .get<ChipDirective>(ChipDirective)
                .remove();
            fixture.detectChanges();
            tick(250);

            expect(collection.changeNoteStacks).toHaveBeenCalledWith(selectedNote, []);
        }));
    });

    describe('title textarea', () => {
        it('should move focus first index of snippet when pressed enter in title textarea.', () => {
            fixture.detectChanges();

            spyOn(listManager, 'focusTo');
            dispatchKeyboardEvent(getTitleTextareaEl(), 'keydown', ENTER);

            expect(listManager.focusTo).toHaveBeenCalledWith(0);
        });

        it('should move focus first index of snippet when pressed arrow down in '
            + 'title textarea.', () => {
            fixture.detectChanges();

            spyOn(listManager, 'focusTo');
            dispatchKeyboardEvent(getTitleTextareaEl(), 'keydown', DOWN_ARROW);

            expect(listManager.focusTo).toHaveBeenCalledWith(0);
        });
    });

    describe('snippet list manager', () => {
        it('should set container element and view container ref on ngOnInit.', () => {
            spyOn(listManager, 'setContainerElement').and.callThrough();
            spyOn(listManager, 'setViewContainerRef').and.callThrough();

            fixture.detectChanges();

            expect(listManager.setContainerElement).toHaveBeenCalledWith(component.snippetsList.nativeElement);
            expect(listManager.setViewContainerRef).toHaveBeenCalledWith(component._viewContainerRef);
        });

        it('should focus title textarea when top focused out.', () => {
            fixture.detectChanges();

            listManager['_topFocusOut'].next();
            fixture.detectChanges();

            expect(document.activeElement).toEqual(component.titleTextarea.nativeElement);
        });
    });

    describe('MenuEvent.NEW_TEXT_SNIPPET', () => {
        it('should not handle create new snippet event if active snippet index is \'null\'.', () => {
            fixture.detectChanges();

            ensureSelectNoteAndLoadNoteContent();
            deactivateSnippet();
            fixture.detectChanges();

            menuMessages.next(MenuEvent.NEW_TEXT_SNIPPET);

            expect(listManager.handleSnippetRefEvent).not.toHaveBeenCalled();
        });

        it('should handle create new snippet event when active snippet index is exists.', () => {
            fixture.detectChanges();

            ensureSelectNoteAndLoadNoteContent();
            activateSnippetAtIndex(2);
            fixture.detectChanges();

            menuMessages.next(MenuEvent.NEW_TEXT_SNIPPET);

            expect(listManager.handleSnippetRefEvent).toHaveBeenCalled();

            const event = (listManager.handleSnippetRefEvent as Spy)
                .calls.mostRecent().args[0] as NoteSnippetEditorNewSnippetEvent;

            // noinspection SuspiciousInstanceOfGuard
            expect(event instanceof NoteSnippetEditorNewSnippetEvent).toBe(true);
            expect(event.payload.snippet).toEqual({
                type: NoteSnippetTypes.TEXT,
                value: '',
            } as NoteSnippetContent);
        });
    });

    describe('MenuEvent.NEW_CODE_SNIPPET', () => {
        it('should open NoteCodeSnippetActionDialog when active snippet index is exists. '
            + 'And handle create new snippet when user close dialog with result.', () => {
            fixture.detectChanges();

            ensureSelectNoteAndLoadNoteContent();
            activateSnippetAtIndex(0);
            fixture.detectChanges();

            menuMessages.next(MenuEvent.NEW_CODE_SNIPPET);

            // Expect dialog.
            const actionDialog = mockDialog.getByComponent<NoteCodeSnippetActionDialogComponent,
                NoteCodeSnippetActionDialogData,
                NoteCodeSnippetActionDialogResult>(
                NoteCodeSnippetActionDialogComponent,
            );

            expect(actionDialog).toBeDefined();
            expect(actionDialog.config.data.actionType).toEqual('create' as NoteCodeSnippetActionDialogActionType);

            actionDialog.close({
                codeLanguageId: 'typescript',
                codeFileName: 'i-love-ts.ts',
            });

            const event = (
                listManager.handleSnippetRefEvent as Spy
            ).calls.mostRecent().args[0] as NoteSnippetEditorNewSnippetEvent;

            expect(listManager.handleSnippetRefEvent).toHaveBeenCalled();
            // noinspection SuspiciousInstanceOfGuard
            expect(event instanceof NoteSnippetEditorNewSnippetEvent).toBe(true);
            expect(event.payload.snippet).toEqual({
                type: NoteSnippetTypes.CODE,
                value: '',
                codeLanguageId: 'typescript',
                codeFileName: 'i-love-ts.ts',
            } as NoteSnippetContent);
        });
    });

    describe('MenuEvent.INSERT_IMAGE', () => {
        let snippets: NoteSnippetContent[];

        beforeEach(() => {
            fixture.detectChanges();

            const snippetDummy = new NoteSnippetContentDummy();

            snippets = [
                snippetDummy.create(NoteSnippetTypes.TEXT),
                snippetDummy.create(NoteSnippetTypes.CODE),
            ];

            const content = { snippets } as NoteContent;

            store.dispatch(new LoadNoteContentCompleteAction({
                note: new NoteItemDummy().create(),
                content,
            }));
            listManager.addAllSnippetsFromContent(content);

            fixture.detectChanges();
        });

        it('should show file open dialog when insert image event received while type of active snippet is '
            + '\'TEXT\'. And dispatch NoteSnippetEditorInsertImageEvent when user select file.', fakeAsync(() => {
            const selectedNote = noteDummy.create();
            const content = contentDummy.create();
            content.snippets[0] = new NoteSnippetContentDummy().create(NoteSnippetTypes.TEXT);

            ensureSelectNoteAndLoadNoteContent(selectedNote, content);

            activateSnippetAtIndex(0);
            fixture.detectChanges();

            spyOn(nativeDialog, 'showOpenDialog').and.returnValue(of({
                isSelected: true,
                filePaths: ['/foo/bar/assets/some-image.png'],
            } as NativeDialogOpenResult));

            spyOn(noteEditor, 'copyAssetFile').and.returnValue(of({
                fileNameWithoutExtension: 'some-image',
                relativePathToWorkspaceDir: './some-image.png',
            } as Asset));

            menuMessages.next(MenuEvent.INSERT_IMAGE);
            flush();
            flush();
            flush();

            expect(nativeDialog.showOpenDialog).toHaveBeenCalledWith({
                message: 'Choose an image:',
                properties: NativeDialogProperties.OPEN_FILE,
                fileFilters: [nativeDialogFileFilters.IMAGES],
            } as NativeDialogConfig);

            expect(noteEditor.copyAssetFile).toHaveBeenCalledWith(
                AssetTypes.IMAGE,
                selectedNote.contentFilePath,
                '/foo/bar/assets/some-image.png',
            );

            expect(listManager.handleSnippetRefEvent).toHaveBeenCalled();

            const event = (
                listManager.handleSnippetRefEvent as Spy
            ).calls.first().args[0] as NoteSnippetEditorInsertImageEvent;

            // noinspection SuspiciousInstanceOfGuard
            expect(event instanceof NoteSnippetEditorInsertImageEvent).toBe(true);
            expect(event.payload.fileName).toEqual('some-image');
            expect(event.payload.filePath).toEqual('./some-image.png');

            discardPeriodicTasks();
        }));
    });

    describe('Note title', () => {
        it('should update note title when selected note changes.', () => {
            const prevSelectedNote = noteDummy.create();
            ensureSelectNoteAndLoadNoteContent(prevSelectedNote);
            fixture.detectChanges();

            expect(getTitleTextareaEl().value).toContain(prevSelectedNote.title);

            const nextSelectedNote = noteDummy.create();
            selectedNoteStream.next(nextSelectedNote);
            fixture.detectChanges();

            expect(getTitleTextareaEl().value).toContain(nextSelectedNote.title);
        });

        it('should change note title with collection service when title value changes '
            + 'after 250ms.', fakeAsync(() => {
            (collection.changeNoteTitle as Spy).and.callFake(() => Promise.resolve(null));

            const [selectedNote] = ensureSelectNoteAndLoadNoteContent();
            fixture.detectChanges();

            typeInElement('New Title', getTitleTextareaEl());
            fixture.detectChanges();
            tick(250);
            flush();

            expect(collection.changeNoteTitle).toHaveBeenCalledWith(selectedNote, 'New Title');
        }));
    });
});
