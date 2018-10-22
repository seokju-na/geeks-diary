import { Component, ElementRef, NgModule, ViewChild, ViewContainerRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { fastTestSetup } from '../../../../test/helpers';
import { NoteSnippetTypes } from '../../../core/note';
import { StackModule } from '../../stack';
import { noteReducerMap } from '../note.reducer';
import { NoteStateWithRoot } from '../note.state';
import { NoteContentDummy, NoteSnippetContentDummy } from './dummies';
import { NoteCodeSnippetEditorComponent } from './note-code-snippet-editor/note-code-snippet-editor.component';
import { NoteSnippetContent } from './note-content.model';
import {
    AppendSnippetAction,
    InsertSnippetAction,
    RemoveSnippetAction,
    UpdateSnippetAction,
} from './note-editor.actions';
import {
    NoteSnippetEditorMoveFocusToNextEvent,
    NoteSnippetEditorMoveFocusToPreviousEvent,
    NoteSnippetEditorRef,
    NoteSnippetEditorRemoveThisEvent,
    NoteSnippetEditorSwitchSnippetAfterThisEvent,
    NoteSnippetEditorValueChangedEvent,
} from './note-snippet-editor';
import { NoteSnippetListManager } from './note-snippet-list-manager';
import { NoteTextSnippetEditorComponent } from './note-text-snippet-editor/note-text-snippet-editor.component';


describe('browser.note.noteEditor.NoteSnippetListManager', () => {
    let listManager: NoteSnippetListManager;

    let fixture: ComponentFixture<TestNoteSnippetListHostComponent>;
    let component: TestNoteSnippetListHostComponent;

    let store: Store<NoteStateWithRoot>;

    const getElById = (id: string): HTMLElement => component.host.nativeElement.querySelector(`#${id}`);
    const getPaneElByIndex = (index: number): HTMLElement =>
        component.host.nativeElement.querySelector(`.NoteSnippetEditorPane:nth-child(${index + 1})`);
    const getPaneElList = (): NodeListOf<HTMLElement> =>
        component.host.nativeElement.querySelectorAll('.NoteSnippetEditorPane');

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                imports: [
                    StoreModule.forRoot({
                        note: combineReducers(noteReducerMap),
                    }),
                    TestNoteSnippetListHostModule,
                ],
                providers: [
                    NoteSnippetListManager,
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        listManager = TestBed.get(NoteSnippetListManager);
        store = TestBed.get(Store);

        fixture = TestBed.createComponent(TestNoteSnippetListHostComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        listManager
            .setContainerElement(component.host.nativeElement)
            .setViewContainerRef(component.viewContainerRef);
    });

    afterEach(() => {
        fixture.debugElement.queryAll(By.css('.NoteSnippetEditorPane')).forEach((paneDe) => {
            (paneDe.nativeElement as HTMLElement).remove();
        });
    });

    describe('addAllSnippetsFromContent', () => {
        it('should append all snippets from content.', () => {
            const content = new NoteContentDummy().create(5);

            listManager.addAllSnippetsFromContent(content);
            fixture.detectChanges();

            expect(getPaneElList().length).toEqual(5, 'expect pane\'s count are same.');
        });
    });

    describe('appendSnippet', () => {
        it('should append note snippet editor with attached component '
            + 'for \'gd-note-text-snippet-editor\'.', () => {
            const snippet = new NoteSnippetContentDummy().create(NoteSnippetTypes.TEXT);

            listManager.appendSnippet(snippet);
            fixture.detectChanges();

            const pane = getPaneElList().item(0) as HTMLElement;

            expect(pane).toBeDefined();
            expect(pane.querySelector('gd-note-text-snippet-editor')).not.toBeNull();
        });

        it('should append note snippet editor with attached component '
            + 'for \'gd-note-code-snippet-editor\'.', () => {
            const snippet = new NoteSnippetContentDummy().create(NoteSnippetTypes.CODE);

            listManager.appendSnippet(snippet);
            fixture.detectChanges();

            const pane = getPaneElList().item(0) as HTMLElement;

            expect(pane).toBeDefined();
            expect(pane.querySelector('gd-note-code-snippet-editor')).not.toBeNull();
        });

        it('should focus after snippet appended.', () => {
            const snippet = new NoteSnippetContentDummy().create();
            const newSnippetRef = listManager.appendSnippet(snippet);

            spyOn(newSnippetRef.componentInstance, 'focus');
            fixture.detectChanges();

            expect(newSnippetRef.componentInstance.focus).toHaveBeenCalled();
        });
    });

    describe('insertSnippetAt', () => {
        beforeEach(() => {
            listManager.addAllSnippetsFromContent(new NoteContentDummy().create(5));
            fixture.detectChanges();
        });

        it('should insert note snippet at index 0.', () => {
            const snippet = new NoteSnippetContentDummy().create();

            const newSnippetRef = listManager.insertSnippetAt(0, snippet);
            fixture.detectChanges();

            expect(getElById(newSnippetRef.id)).not.toBeNull();
            expect(getPaneElByIndex(0).id).toEqual(newSnippetRef.paneElementId);
        });

        it('should insert note snippet at index 3.', () => {
            const snippet = new NoteSnippetContentDummy().create();

            const newSnippetRef = listManager.insertSnippetAt(3, snippet);
            fixture.detectChanges();

            expect(getElById(newSnippetRef.id)).not.toBeNull();
            expect(getPaneElByIndex(3).id).toEqual(newSnippetRef.paneElementId);
        });

        it('should insert note snippet at index 4.', () => {
            const snippet = new NoteSnippetContentDummy().create();

            const newSnippetRef = listManager.insertSnippetAt(4, snippet);
            fixture.detectChanges();

            expect(getElById(newSnippetRef.id)).not.toBeNull();
            expect(getPaneElByIndex(4).id).toEqual(newSnippetRef.paneElementId);
        });

        it('should focus after note inserted.', () => {
            const snippet = new NoteSnippetContentDummy().create();
            const newSnippetRef = listManager.insertSnippetAt(3, snippet);

            spyOn(newSnippetRef.componentInstance, 'focus');
            fixture.detectChanges();

            expect(newSnippetRef.componentInstance.focus).toHaveBeenCalled();
        });
    });

    describe('removeSnippetAt', () => {
        let snippetRefs: NoteSnippetEditorRef<any>[];

        beforeEach(() => {
            const content = new NoteContentDummy().create(5);

            snippetRefs = listManager.addAllSnippetsFromContent(content);
            fixture.detectChanges();
        });

        it('should remove note snippet at index.', () => {
            const paneId = snippetRefs[3].paneElementId;
            const componentId = snippetRefs[3].id;

            listManager.removeSnippetAt(3);
            fixture.detectChanges();

            expect(getElById(componentId)).toBeNull('note snippet editor component should not be exists.');
            expect(getElById(paneId)).toBeNull('pane should not be exists.');
        });

        it('should move focus to previous after remove snippet.', () => {
            spyOn(listManager, 'moveFocusByIndex');

            listManager.removeSnippetAt(2);
            fixture.detectChanges();

            expect(listManager.moveFocusByIndex).toHaveBeenCalledWith(2, -1);
        });
    });

    describe('removeAllSnippets', () => {
        beforeEach(() => {
            listManager.addAllSnippetsFromContent(new NoteContentDummy().create(5));
            fixture.detectChanges();
        });

        it('should remove all note snippets.', () => {
            listManager.removeAllSnippets();
            fixture.detectChanges();

            expect(getPaneElList().length).toEqual(0);
        });
    });

    describe('focusTo', () => {
        let snippetRefs: NoteSnippetEditorRef<any>[];

        beforeEach(() => {
            snippetRefs = listManager.addAllSnippetsFromContent(new NoteContentDummy().create(5));
            fixture.detectChanges();
        });

        it('should focus for target index.', () => {
            spyOn(snippetRefs[2].componentInstance, 'focus');
            listManager.focusTo(2);
            expect(snippetRefs[2].componentInstance.focus).toHaveBeenCalled();
        });
    });

    describe('moveFocusByIndex', () => {
        let snippetRefs: NoteSnippetEditorRef<any>[];

        beforeEach(() => {
            snippetRefs = listManager.addAllSnippetsFromContent(new NoteContentDummy().create(5));
            fixture.detectChanges();
        });

        it('should move focus by direction \'-1\'.', () => {
            spyOn(snippetRefs[2].componentInstance, 'focus');
            spyOn(snippetRefs[2].componentInstance, 'setPositionToBottom');

            listManager.moveFocusByIndex(3, -1);

            expect(snippetRefs[2].componentInstance.focus).toHaveBeenCalled();
            expect(snippetRefs[2].componentInstance.setPositionToBottom).toHaveBeenCalled();
        });

        it('should move focus by direction \'1\'.', () => {
            spyOn(snippetRefs[1].componentInstance, 'focus');
            spyOn(snippetRefs[1].componentInstance, 'setPositionToTop');

            listManager.moveFocusByIndex(0, 1);

            expect(snippetRefs[1].componentInstance.focus).toHaveBeenCalled();
            expect(snippetRefs[1].componentInstance.setPositionToTop).toHaveBeenCalled();
        });
    });

    describe('handle events via references', () => {
        let snippetRefs: NoteSnippetEditorRef<any>[];

        beforeEach(() => {
            spyOn(store, 'dispatch');

            snippetRefs = listManager.addAllSnippetsFromContent(new NoteContentDummy().create(5));
            fixture.detectChanges();
        });

        it('should call \'removeSnippetAt\' and dispatch \'REMOVE_SNIPPET\' action when \'REMOVE_THIS\' '
            + 'event called.', () => {
            spyOn(listManager, 'removeSnippetAt');

            snippetRefs[2].events.next(new NoteSnippetEditorRemoveThisEvent(snippetRefs[2]));

            expect(listManager.removeSnippetAt).toHaveBeenCalledWith(2);
            expect(store.dispatch).toHaveBeenCalledWith(new RemoveSnippetAction({ index: 2 }));
        });

        it('should not remove snippet if index of snippet is \'0\' and has only one snippet at list when '
            + '\'REMOVE_THIS\' event called.', () => {
            // Initialize snippets.
            listManager.removeAllSnippets();
            const snippetRef = listManager.appendSnippet(new NoteSnippetContentDummy().create());
            fixture.detectChanges();

            spyOn(listManager, 'removeSnippetAt');
            snippetRef.events.next(new NoteSnippetEditorRemoveThisEvent(snippetRef));

            expect(listManager.removeSnippetAt).not.toHaveBeenCalledWith(0);
            expect(store.dispatch).not.toHaveBeenCalledWith(new RemoveSnippetAction({ index: 0 }));
        });

        it('should call \'moveFocusByIndex\' with \'-1\' direction when \'MOVE_FOCUS_TO_PREVIOUS\' event '
            + 'called.', () => {
            spyOn(listManager, 'moveFocusByIndex');

            snippetRefs[4].events.next(new NoteSnippetEditorMoveFocusToPreviousEvent(snippetRefs[4]));

            expect(listManager.moveFocusByIndex).toHaveBeenCalledWith(4, -1);
        });

        it('should emit \'topFocusOut\' when \'MOVE_FOCUS_TO_PREVIOUS\' event called at index 0.', () => {
            const callback = jasmine.createSpy('callback');
            const subscription = listManager.topFocusOut().subscribe(callback);

            snippetRefs[0].events.next(new NoteSnippetEditorMoveFocusToPreviousEvent(snippetRefs[0]));

            expect(callback).toHaveBeenCalled();
            subscription.unsubscribe();
        });

        it('should call \'moveFocusByIndex\' with \'1\' direction when \'MOVE_FOCUS_TO_NEXT\' event '
            + 'called.', () => {
            spyOn(listManager, 'moveFocusByIndex');

            snippetRefs[2].events.next(new NoteSnippetEditorMoveFocusToNextEvent(snippetRefs[2]));

            expect(listManager.moveFocusByIndex).toHaveBeenCalledWith(2, 1);
        });

        it('should dispatch \'UPDATE_SNIPPET\' action when \'VALUE_CHANGED\' event called.', () => {
            snippetRefs[0].events.next(new NoteSnippetEditorValueChangedEvent(
                snippetRefs[0],
                { value: 'Hello World!' },
            ));

            expect(store.dispatch).toHaveBeenCalledWith(new UpdateSnippetAction({
                index: 0,
                patch: { value: 'Hello World!' },
            }));
        });

        // it('should call \'insertSnippetAt\' and dispatch \'INSERT_SNIPPET\' action with new code type '
        //     + 'snippet when \'SWITCH_SNIPPET_AFTER_THIS\' event with text type snippet at not last '
        //     + 'index called.', () => {
        //     spyOn(listManager, 'insertSnippetAt');
        //
        //     snippetRefs[0]._config.type = NoteSnippetTypes.TEXT;
        //     snippetRefs[0].events.next(new NoteSnippetEditorSwitchSnippetAfterThisEvent(snippetRefs[0]));
        //
        //     const newSnippet: NoteSnippetContent = {
        //         type: NoteSnippetTypes.CODE,
        //         value: '',
        //         codeLanguageId: '',
        //         codeFileName: '(No Filename)',
        //     };
        //
        //     expect(listManager.insertSnippetAt).toHaveBeenCalledWith(1, newSnippet);
        //     expect(store.dispatch).toHaveBeenCalledWith(new InsertSnippetAction({ index: 1, snippet: newSnippet }));
        // });

        it('should call \'insertSnippetAt\' and dispatch \'INSERT_SNIPPET\' action with new text type '
            + 'snippet with \'SWITCH_SNIPPET_AFTER_THIS\' event with code type snippet at not last '
            + 'index called.', () => {
            spyOn(listManager, 'insertSnippetAt');

            snippetRefs[2]._config.type = NoteSnippetTypes.CODE;
            snippetRefs[2].events.next(new NoteSnippetEditorSwitchSnippetAfterThisEvent(snippetRefs[2]));

            const newSnippet: NoteSnippetContent = {
                type: NoteSnippetTypes.TEXT,
                value: '',
            };

            expect(listManager.insertSnippetAt).toHaveBeenCalledWith(3, newSnippet);
            expect(store.dispatch).toHaveBeenCalledWith(new InsertSnippetAction({ index: 3, snippet: newSnippet }));
        });

        it('should call \'appendSnippet\' and dispatch \'APPEND_SNIPPET\' action with new code type '
            + 'snippet with \'SWITCH_SNIPPET_AFTER_THIS\' event with text type snippet at last index called.', () => {
            spyOn(listManager, 'appendSnippet');

            snippetRefs[4]._config.type = NoteSnippetTypes.CODE;
            snippetRefs[4].events.next(new NoteSnippetEditorSwitchSnippetAfterThisEvent(snippetRefs[4]));

            const newSnippet: NoteSnippetContent = {
                type: NoteSnippetTypes.TEXT,
                value: '',
            };

            expect(listManager.appendSnippet).toHaveBeenCalledWith(newSnippet);
            expect(store.dispatch).toHaveBeenCalledWith(new AppendSnippetAction({ snippet: newSnippet }));
        });
    });
});


@Component({
    template: `
        <div #host></div>
    `,
})
class TestNoteSnippetListHostComponent {
    @ViewChild('host') host: ElementRef<HTMLElement>;

    constructor(public viewContainerRef: ViewContainerRef) {
    }
}


@NgModule({
    imports: [
        StackModule,
    ],
    declarations: [
        NoteTextSnippetEditorComponent,
        NoteCodeSnippetEditorComponent,
        TestNoteSnippetListHostComponent,
    ],
    entryComponents: [
        NoteTextSnippetEditorComponent,
        NoteCodeSnippetEditorComponent,
    ],
    exports: [
        NoteTextSnippetEditorComponent,
        NoteCodeSnippetEditorComponent,
        TestNoteSnippetListHostComponent,
    ],
})
class TestNoteSnippetListHostModule {
}
