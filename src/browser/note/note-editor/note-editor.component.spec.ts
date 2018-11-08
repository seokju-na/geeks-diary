import { DOWN_ARROW, ENTER } from '@angular/cdk/keycodes';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { of, Subject } from 'rxjs';
import { dispatchKeyboardEvent, fastTestSetup } from '../../../../test/helpers';
import { MockDialog } from '../../../../test/mocks/browser';
import { Asset, AssetTypes } from '../../../core/asset';
import { NoteSnippetTypes } from '../../../core/note';
import { MenuEvent, MenuService, NativeDialog, NativeDialogOpenResult, SharedModule } from '../../shared';
import { Dialog } from '../../ui/dialog';
import { UiModule } from '../../ui/ui.module';
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

    let menuMessages: Subject<MenuEvent>;

    const noteDummy = new NoteItemDummy();
    const contentDummy = new NoteContentDummy();

    const getTitleTextareaEl = (): HTMLTextAreaElement =>
        fixture.debugElement.query(
            By.css('.NoteEditor__titleTextarea > textarea'),
        ).nativeElement as HTMLTextAreaElement;

    function ensureSnippets(snippetCount = 5): void {
        const note = noteDummy.create();
        const content = contentDummy.create(snippetCount);

        store.dispatch(new LoadNoteContentCompleteAction({ note, content }));
        listManager.addAllSnippetsFromContent(content);
    }

    function activateSnippetAtIndex(index: number): void {
        store.dispatch(new FocusSnippetAction({ index }));
    }

    function deactivateSnippet(): void {
        store.dispatch(new BlurSnippetAction());
    }

    fastTestSetup();

    beforeAll(async () => {
        menu = jasmine.createSpyObj('menu', [
            'onMessage',
        ]);

        await TestBed
            .configureTestingModule({
                imports: [
                    UiModule,
                    SharedModule,
                    StoreModule.forRoot({
                        note: combineReducers(noteReducerMap),
                    }),
                    NoteSharedModule,
                    NoteEditorModule,
                    ...MockDialog.imports(),
                ],
                providers: [
                    { provide: MenuService, useValue: menu },
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

        menuMessages = new Subject<MenuEvent>();

        (menu.onMessage as Spy).and.returnValue(menuMessages.asObservable());
        spyOn(listManager, 'handleSnippetRefEvent').and.callThrough();

        fixture = TestBed.createComponent(NoteEditorComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        menuMessages.complete();
        mockDialog.closeAll();
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

            ensureSnippets();
            deactivateSnippet();
            fixture.detectChanges();

            menuMessages.next(MenuEvent.NEW_TEXT_SNIPPET);

            expect(listManager.handleSnippetRefEvent).not.toHaveBeenCalled();
        });

        it('should handle create new snippet event when active snippet index is exists.', () => {
            fixture.detectChanges();

            ensureSnippets();
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

            ensureSnippets();
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
            + '\'TEXT\'. And dispatch NoteSnippetEditorInsertImageEvent when user select file.', () => {
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

            expect(nativeDialog.showOpenDialog).toHaveBeenCalled();
            expect(noteEditor.copyAssetFile).toHaveBeenCalledWith(
                AssetTypes.IMAGE,
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
        });

        it('should show file open dialog when insert image event received wile type of active snippet is '
            + '\'TEXT\'. When failed copy image file because file name is duplicated, then open file name change '
            + 'dialog.', () => {
        });
    });
});
