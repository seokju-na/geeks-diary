import { async, ComponentFixture, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { KeyCodes } from '../../../common/key-codes';
import {
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    typeInElement,
} from '../../../testing/fake-event';
import { verifyFormFieldError } from '../../../testing/validation';
import { MonacoService } from '../../core/monaco.service';
import { SharedModule } from '../../shared/shared.module';
import { StackDummyFactory } from '../../stack/dummies';
import { Stack } from '../../stack/models';
import { StackViewer } from '../../stack/stack-viewer';
import {
    MoveFocusToNextSnippetAction,
    MoveFocusToPreviousSnippetAction,
    RemoveSnippetAction, UpdateSnippetContentAction,
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

    let stackViewer: StackViewer;
    let store: Store<EditorStateForFeature>;

    const getInputField = (): HTMLTextAreaElement =>
        document.querySelector('.monaco-editor .inputarea');

    const overrideConfig = (newConfig: Partial<EditorSnippetConfig>) => {
        config = { ...config, ...newConfig };

        TestBed.overrideProvider(EDITOR_SNIPPET_CONFIG, {
            useValue: newConfig,
        });
    };

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
            isNewSnippet: false,
        };
    });

    beforeEach(async(() => {
        TestBed
            .configureTestingModule({
                imports: [
                    SharedModule,
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
                declarations: [EditorCodeSnippetComponent],
            })
            .compileComponents();
    }));

    afterEach(() => {
        if (fixture) {
            fixture.debugElement.nativeElement.remove();
        }
    });

    describe('initialize', () => {
        beforeEach(() => {
            createFixture();
        });

        it('should show initial value when initialized editor.', () => {
            expect(component.getValue()).toEqual(config.initialValue);
        });

        it('should language has been set.', () => {
            expect(component.getLanguage()).toEqual(config.language);
        });
    });

    describe('isCurrentPositionTop(): boolean', () => {
        beforeEach(() => {
            createFixture();
        });

        it('should be true when cursor in the start line of editor.', () => {
            component._editor.setPosition({
                lineNumber: 1,
                column: 0,
            });

            expect(component.isCurrentPositionTop()).toBe(true);
        });
    });

    describe('isCurrentPositionBottom(): boolean', () => {
        beforeEach(() => {
            createFixture();
        });

        it('if editor has only one line, it should be true on both top and bottom.', () => {
            expect(component.isCurrentPositionTop()).toBe(true);
            expect(component.isCurrentPositionBottom()).toBe(true);
        });

        it('should be true when cursor in the last line of editor', () => {
            component.setValue('hello\nworld!');
            component._editor.setPosition({
                lineNumber: 2,
                column: 0,
            });

            expect(component.isCurrentPositionBottom()).toBe(true);
        });
    });

    describe('setPositionToTop(): void', () => {
        beforeEach(() => {
            createFixture();
        });

        it('should cursor located at first line.', () => {
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
        beforeEach(() => {
            createFixture();
        });

        it('should cursor located at last line.', () => {
            component.setValue('Some long\nparagraph.');
            expect(component.isCurrentPositionBottom()).toBe(false);

            component.setPositionToBottom();
            expect(component.isCurrentPositionBottom()).toBe(true);
        });
    });

    describe('typing', () => {
        beforeEach(() => {
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
        it('should fill language and file name at input when setting mode on', () => {
            overrideConfig({ fileName: 'test-file.js' });
            createFixture();

            const settingButton = fixture.debugElement.query(
                By.css('button[aria-label="setting-button"]'));
            settingButton.nativeElement.click();
            fixture.detectChanges();

            // Expect setting form has been appeared.
            const settingForm = fixture.debugElement.query(
                By.css('form.NoteCodeEditorSnippet__settingForm'));
            expect(settingForm).not.toBeNull();

            const languageInputEl = settingForm.query(
                By.css('input[name="language"]')).nativeElement;
            const fileNameInputEl = settingForm.query(
                By.css('input[name="fileName"]')).nativeElement;

            expect(languageInputEl.value).toEqual('javascript');
            expect(fileNameInputEl.value).toEqual('test-file.js');
        });

        it('should setting form appeared when snippet initialized ' +
            'if \'isNewSnippet\' is true.', () => {

            overrideConfig({ isNewSnippet: true });
            createFixture();

            const settingForm = fixture.debugElement.query(
                By.css('form.NoteCodeEditorSnippet__settingForm'));
            expect(settingForm).not.toBeNull();
        });

        it('should not fill language and file name when snippet is new.', () => {
            overrideConfig({ fileName: 'test-file.js', isNewSnippet: true });
            createFixture();

            const languageInputEl = fixture.debugElement.query(
                By.css('input[name="language"]')).nativeElement;
            const fileNameInputEl = fixture.debugElement.query(
                By.css('input[name="fileName"]')).nativeElement;

            expect(languageInputEl.value).toEqual('');
            expect(fileNameInputEl.value).toEqual('');
        });

        it('should get \'required\' error touched language input ' +
            'but didn\'t type any value.', () => {

            overrideConfig({ isNewSnippet: true });
            createFixture();

            const languageInputEl = fixture.debugElement.query(
                By.css('input[name="language"]')).nativeElement;

            dispatchFakeEvent(languageInputEl, 'focusin');
            fixture.detectChanges();

            typeInElement('', languageInputEl);
            fixture.detectChanges();

            dispatchFakeEvent(languageInputEl, 'focusout');
            fixture.detectChanges();

            const settingForm = fixture.debugElement.query(
                By.css('form.NoteCodeEditorSnippet__settingForm'));

            verifyFormFieldError(settingForm, 'required');
        });

        it('should fill the language name when an option is selected ' +
            'form options.', () => {

            const dummyFactory = new StackDummyFactory();
            const stacks: Stack[] = [
                dummyFactory.create(true, true, true),
                dummyFactory.create(true, true, true),
                dummyFactory.create(true, true, true),
            ];

            stackViewer = TestBed.get(StackViewer);
            spyOn(stackViewer, 'stacks').and.returnValue(stacks);

            overrideConfig({ isNewSnippet: true });
            createFixture();

            const languageInputEl = fixture.debugElement.query(
                By.css('input[name="language"]')).nativeElement;

            typeInElement('stack-2', languageInputEl);
            fixture.detectChanges();

            dispatchKeyboardEvent(languageInputEl, 'keydown', KeyCodes.DOWN_ARROW);
            flush();
            fixture.detectChanges();

            dispatchKeyboardEvent(languageInputEl, 'keydown', KeyCodes.ENTER);
            fixture.detectChanges();

            expect(languageInputEl.value).toContain('stack-2');
        });

        it('should dispatch \'UPDATE_SNIPPET_CONTENT\' action ' +
            'after submit setting form', () => {

            store = TestBed.get(Store);
            spyOn(store, 'dispatch').and.callThrough();

            overrideConfig({ isNewSnippet: true });
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
                By.css('button[aria-label="save-button"]'));
            submitButton.nativeElement.click();
            fixture.detectChanges();

            const expectedPayload = {
                content: { language: 'some-language', fileName: 'some-filename' },
            };
            const expectedAction = new UpdateSnippetContentAction(expectedPayload);

            expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
        });
    });
});
