import { DOWN_ARROW, ENTER } from '@angular/cdk/keycodes';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { Subject } from 'rxjs';
import { dispatchKeyboardEvent, fastTestSetup } from '../../../../test/helpers';
import { MockDialog } from '../../../../test/mocks/browser';
import { NoteSnippetTypes } from '../../../core/note';
import { MenuEvent, MenuService, SharedModule } from '../../shared';
import { Dialog } from '../../ui/dialog';
import { UiModule } from '../../ui/ui.module';
import { NoteItemDummy } from '../note-collection/dummies';
import { noteReducerMap } from '../note.reducer';
import { NoteStateWithRoot } from '../note.state';
import { NoteContentDummy } from './dummies';
import { NoteCodeSnippetActionDialog } from './note-code-snippet-action-dialog/note-code-snippet-action-dialog';
import {
    NoteCodeSnippetActionDialogActionType,
    NoteCodeSnippetActionDialogData,
} from './note-code-snippet-action-dialog/note-code-snippet-action-dialog-data';
import { NoteCodeSnippetActionDialogResult } from './note-code-snippet-action-dialog/note-code-snippet-action-dialog-result';
import { NoteCodeSnippetActionDialogComponent } from './note-code-snippet-action-dialog/note-code-snippet-action-dialog.component';
import { NoteSnippetContent } from './note-content.model';
import { BlurSnippetAction, FocusSnippetAction, LoadNoteContentCompleteAction } from './note-editor.actions';
import { NoteEditorComponent } from './note-editor.component';
import { NoteSnippetEditorNewSnippetEvent } from './note-snippet-editor';
import { NoteSnippetListManager } from './note-snippet-list-manager';
import Spy = jasmine.Spy;


describe('browser.note.noteEditor.NoteEditorComponent', () => {
    let fixture: ComponentFixture<NoteEditorComponent>;
    let component: NoteEditorComponent;

    let store: Store<NoteStateWithRoot>;
    let listManager: NoteSnippetListManager;
    let menu: MenuService;
    let mockDialog: MockDialog;

    let tapFocusOuts: Subject<void>;
    let menuMessages: Subject<MenuEvent>;

    const getTitleTextareaEl = (): HTMLTextAreaElement =>
        fixture.debugElement.query(
            By.css('.NoteEditor__titleTextarea > textarea'),
        ).nativeElement as HTMLTextAreaElement;

    function ensureSnippets(snippetCount = 5): void {
        const note = new NoteItemDummy().create();
        const content = new NoteContentDummy().create(snippetCount);

        store.dispatch(new LoadNoteContentCompleteAction({ note, content }));
    }

    function activateSnippetAtIndex(index: number): void {
        store.dispatch(new FocusSnippetAction({ index }));
    }

    function deactivateSnippet(): void {
        store.dispatch(new BlurSnippetAction());
    }

    fastTestSetup();

    beforeAll(async () => {
        listManager = jasmine.createSpyObj('listManager', [
            'getSnippetRefByIndex',
            'topFocusOut',
            'setContainerElement',
            'setViewContainerRef',
            'handleSnippetRefEvents',
            'focusTo',
        ]);
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
                    ...MockDialog.imports(),
                ],
                providers: [
                    { provide: MenuService, useValue: menu },
                    { provide: NoteSnippetListManager, useValue: listManager },
                    ...MockDialog.providers(),
                    NoteCodeSnippetActionDialog,
                ],
                declarations: [
                    NoteEditorComponent,
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        store = TestBed.get(Store);
        mockDialog = TestBed.get(Dialog);

        tapFocusOuts = new Subject<void>();
        menuMessages = new Subject<MenuEvent>();

        (listManager.setContainerElement as Spy).and.returnValue(listManager);
        (listManager.setViewContainerRef as Spy).and.returnValue(listManager);
        (listManager.topFocusOut as Spy).and.returnValue(tapFocusOuts.asObservable());

        (menu.onMessage as Spy).and.returnValue(menuMessages.asObservable());

        fixture = TestBed.createComponent(NoteEditorComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        tapFocusOuts.complete();
        menuMessages.complete();

        mockDialog.closeAll();
    });

    describe('title textarea', () => {
        it('should move focus first index of snippet when pressed enter in title textarea.', () => {
            fixture.detectChanges();

            dispatchKeyboardEvent(getTitleTextareaEl(), 'keydown', ENTER);

            expect(listManager.focusTo).toHaveBeenCalledWith(0);
        });

        it('should move focus first index of snippet when pressed arrow down in '
            + 'title textarea.', () => {
            fixture.detectChanges();

            dispatchKeyboardEvent(getTitleTextareaEl(), 'keydown', DOWN_ARROW);

            expect(listManager.focusTo).toHaveBeenCalledWith(0);
        });
    });

    describe('snippet list manager', () => {
        it('should set container element and view container ref on ngOnInit.', () => {
            fixture.detectChanges();

            expect(listManager.setContainerElement).toHaveBeenCalledWith(component.snippetsList.nativeElement);
            expect(listManager.setViewContainerRef).toHaveBeenCalledWith(component._viewContainerRef);
        });

        it('should focus title textarea when top focused out.', () => {
            fixture.detectChanges();

            tapFocusOuts.next();
            fixture.detectChanges();

            expect(document.activeElement).toEqual(component.titleTextarea.nativeElement);
        });
    });

    describe('MenuEvent.NEW_TEXT_SNIPPET', () => {
        beforeEach(() => {
            ensureSnippets();
        });

        it('should not handle create new snippet event if active snippet index is \'null\'.', () => {
            deactivateSnippet();
            fixture.detectChanges();

            menuMessages.next(MenuEvent.NEW_TEXT_SNIPPET);

            expect(listManager.handleSnippetRefEvents).not.toHaveBeenCalled();
        });

        it('should handle create new snippet event when active snippet index is exists.', () => {
            activateSnippetAtIndex(2);
            fixture.detectChanges();

            (listManager.getSnippetRefByIndex as Spy).and.returnValue('THIS_IS_SNIPPET_REF');

            menuMessages.next(MenuEvent.NEW_TEXT_SNIPPET);

            expect(listManager.getSnippetRefByIndex).toHaveBeenCalledWith(2);

            const event = (
                listManager.handleSnippetRefEvents as Spy
            ).calls.mostRecent().args[0] as NoteSnippetEditorNewSnippetEvent;

            expect(listManager.handleSnippetRefEvents).toHaveBeenCalled();
            // noinspection SuspiciousInstanceOfGuard
            expect(event instanceof NoteSnippetEditorNewSnippetEvent).toBe(true);
            expect(event.payload.snippet).toEqual({
                type: NoteSnippetTypes.TEXT,
                value: '',
            } as NoteSnippetContent);
        });
    });

    describe('MenuEvent.NEW_CODE_SNIPPET', () => {
        beforeEach(() => {
            ensureSnippets();
        });

        it('should open NoteCodeSnippetActionDialog when active snippet index is exists. '
            + 'And handle create new snippet when user close dialog with result.', () => {
            activateSnippetAtIndex(0);
            fixture.detectChanges();

            (listManager.getSnippetRefByIndex as Spy).and.returnValue('THIS_IS_SNIPPET_REF');

            menuMessages.next(MenuEvent.NEW_CODE_SNIPPET);

            expect(listManager.getSnippetRefByIndex).toHaveBeenCalledWith(0);

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
                listManager.handleSnippetRefEvents as Spy
            ).calls.mostRecent().args[0] as NoteSnippetEditorNewSnippetEvent;

            expect(listManager.handleSnippetRefEvents).toHaveBeenCalled();
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
});
