import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { KeyCodes } from '../../../common/key-codes';
import { dispatchKeyboardEvent, typeInElement } from '../../../testing/fake-event';
import { MonacoService } from '../../core/monaco.service';
import { SharedModule } from '../../shared/shared.module';
import { StackChipComponent } from '../../stack/chip/chip.component';
import { StackViewer } from '../../stack/stack-viewer';
import {
    MoveFocusToNextSnippetAction,
    MoveFocusToPreviousSnippetAction,
    RemoveSnippetAction,
    UpdateSnippetContentAction,
} from '../actions';
import { editorReducerMap, EditorStateForFeature } from '../reducers';
import { EditorCodeSnippetComponent } from './code-snippet.component';
import {
    EDITOR_SNIPPET_CONFIG,
    EDITOR_SNIPPET_REF,
    EditorSnippetConfig,
    EditorSnippetRef,
} from './snippet';


describe('app.editor.snippet.EditorCodeSnippetComponent', () => {
    let fixture: ComponentFixture<EditorCodeSnippetComponent>;
    let component: EditorCodeSnippetComponent;

    let ref: EditorSnippetRef;
    let config: EditorSnippetConfig;

    let store: Store<EditorStateForFeature>;

    const getInputField = (): HTMLTextAreaElement =>
        document.querySelector('.monaco-editor .inputarea');

    const overwriteConfig = (newConfig: Partial<EditorSnippetConfig>) => {
        const overwrittenConfig = { ...config, ...newConfig };

        TestBed.overrideProvider(EDITOR_SNIPPET_CONFIG, {
            useValue: overwrittenConfig,
        });
    };

    const configureTestBed = () => TestBed
        .configureTestingModule({
            imports: [
                SharedModule,
                NoopAnimationsModule,
                StoreModule.forRoot({
                    editor: combineReducers(editorReducerMap),
                }),
            ],
            providers: [
                MonacoService,
                StackViewer,
                { provide: EDITOR_SNIPPET_REF, useValue: ref },
                { provide: EDITOR_SNIPPET_CONFIG, useValue: config },
            ],
            declarations: [
                StackChipComponent,
                EditorCodeSnippetComponent,
            ],
        })
        .compileComponents();

    const createFixture = () => {
        fixture = TestBed.createComponent(EditorCodeSnippetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    };

    beforeEach(() => {
        ref = new EditorSnippetRef('noteId');
        config = {
            initialValue: 'initial value',
            language: 'javascript',
            fileName: 'some-file',
            isNewSnippet: false,
        };
    });

    afterEach(() => {
        if (fixture) {
            fixture.debugElement.nativeElement.remove();
        }
    });

    describe('initialize', () => {
        beforeEach(async(() => {
            configureTestBed();
        }));

        it('should show initial value when initialized editor.', () => {
            createFixture();
            expect(component.getValue()).toEqual(config.initialValue);
        });

        it('should language has been set.', () => {
            createFixture();
            expect(component.getLanguage()).toEqual(config.language);
        });
    });

    describe('isCurrentPositionTop(): boolean', () => {
        beforeEach(async(() => {
            configureTestBed();
        }));

        it('should be true when cursor in the start line of editor.', () => {
            createFixture();

            component._editor.setPosition({
                lineNumber: 1,
                column: 0,
            });

            expect(component.isCurrentPositionTop()).toBe(true);
        });
    });

    describe('isCurrentPositionBottom(): boolean', () => {
        beforeEach(async(() => {
            configureTestBed();
        }));

        it('if editor has only one line, it should be true on both top and bottom.', () => {
            createFixture();

            expect(component.isCurrentPositionTop()).toBe(true);
            expect(component.isCurrentPositionBottom()).toBe(true);
        });

        it('should be true when cursor in the last line of editor', () => {
            createFixture();

            component.setValue('hello\nworld!');
            component._editor.setPosition({
                lineNumber: 2,
                column: 0,
            });

            expect(component.isCurrentPositionBottom()).toBe(true);
        });
    });

    describe('setPositionToTop(): void', () => {
        beforeEach(async(() => {
            configureTestBed();
        }));

        it('should cursor located at first line.', () => {
            createFixture();

            component.setValue('Some long\nparagraph');
            component._editor.setPosition({
                lineNumber: 2,
                column: 0,
            });
            expect(component.isCurrentPositionTop()).toBe(false);

            component.setPositionToTop();
            expect(component.isCurrentPositionTop()).toBe(true);
        });
    });

    describe('setPositionToBottom(): void', () => {
        beforeEach(async(() => {
            configureTestBed();
        }));

        it('should cursor located at last line.', () => {
            createFixture();

            component.setValue('Some long\nparagraph.');
            expect(component.isCurrentPositionBottom()).toBe(false);

            component.setPositionToBottom();
            expect(component.isCurrentPositionBottom()).toBe(true);
        });
    });

    describe('typing', () => {
        beforeEach(() => {
            configureTestBed();
            createFixture();

            store = TestBed.get(Store);
            spyOn(store, 'dispatch').and.callThrough();
        });

        it('should dispatch \'REMOVE_THIS\' action when press a backspace ' +
            'with a blank value', () => {

            const inputField = getInputField();

            component.setValue('');

            dispatchKeyboardEvent(inputField, 'keydown', KeyCodes.BACKSPACE);

            expect(store.dispatch).toHaveBeenCalledWith(
                new RemoveSnippetAction({ snippetId: 'noteId' }));
        });

        it('should dispatch \'MOVE_FOCUS_TO_PREVIOUS\' action when press a up arrow ' +
            'and current cursor in top of lines.', () => {

            const inputField = getInputField();

            component.setPositionToTop();

            dispatchKeyboardEvent(inputField, 'keydown', KeyCodes.UP_ARROW);

            expect(store.dispatch).toHaveBeenCalledWith(
                new MoveFocusToPreviousSnippetAction({ snippetId: 'noteId' }));
        });

        it('should dispatch \'MOVE_FOCUS_TO_NEXT\' action when press a down arrow ' +
            'and current cursor in bottom of lines.', () => {

            const inputField = getInputField();

            component.setPositionToBottom();

            dispatchKeyboardEvent(inputField, 'keydown', KeyCodes.DOWN_ARROW);

            expect(store.dispatch).toHaveBeenCalledWith(
                new MoveFocusToNextSnippetAction({ snippetId: 'noteId' }));
        });
    });

    describe('setting', () => {
        beforeEach(async(() => {
            overwriteConfig({ isNewSnippet: true });
            configureTestBed();
        }));

        it('should setting form appeared if \'isNewSnippet\' value is true ' +
            'which from snippet config, when snippet is initialized', () => {

            createFixture();

            const settingForm = fixture.debugElement.query(
                By.css('form.EditorCodeSnippet__settingForm'));

            expect(component.mode).toEqual('setting');
            expect(settingForm).not.toBeNull();
        });

        it('should dispatch \'UPDATE_SNIPPET_CONTENT\' action ' +
            'after submit setting form', () => {

            store = TestBed.get(Store);
            spyOn(store, 'dispatch').and.callThrough();

            createFixture();

            const languageInputEl = fixture.debugElement.query(
                By.css('input[name="language"]')).nativeElement;
            const fileNameInputEl = fixture.debugElement.query(
                By.css('input[name="fileName"]')).nativeElement;

            typeInElement('some-language', languageInputEl);
            fixture.detectChanges();

            typeInElement('some-filename', fileNameInputEl);
            fixture.detectChanges();

            const submitButton = fixture.debugElement.query(
                By.css('button[aria-label=save-button]'));
            submitButton.nativeElement.click();
            fixture.detectChanges();

            const expectedPayload = {
                content: {
                    id: component.id,
                    language: 'some-language',
                    fileName: 'some-filename',
                },
            };
            const expectedAction = new UpdateSnippetContentAction(expectedPayload);

            expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
        });
    });
});
