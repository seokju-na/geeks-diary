import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { verifyFormFieldError } from 'testing/validation';
import { KeyCodes } from '../../../../common/key-codes';
import {
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    typeInElement,
} from '../../../../testing/fake-event';
import { MonacoService } from '../../../core/monaco.service';
import { SharedModule } from '../../../shared/shared.module';
import { StackViewer } from '../../../stack/stack-viewer';
import { NoteCodeEditorSnippetComponent } from './code-snippet.component';
import {
    NOTE_EDITOR_SNIPPET_CONFIG,
    NOTE_EDITOR_SNIPPET_REF,
    NoteEditorSnippetConfig,
    NoteEditorSnippetEvent,
    NoteEditorSnippetEventNames,
    NoteEditorSnippetRef,
} from './snippet';


describe('app.note.editor.snippet.NoteCodeEditorSnippetComponent', () => {
    let fixture: ComponentFixture<NoteCodeEditorSnippetComponent>;
    let component: NoteCodeEditorSnippetComponent;

    let ref: NoteEditorSnippetRef;
    let config: NoteEditorSnippetConfig;

    const getInputField = (): HTMLTextAreaElement =>
        document.querySelector('.monaco-editor .inputarea');

    const overrideConfig = (newConfig: Partial<NoteEditorSnippetConfig>) => {
        config = { ...config, ...newConfig };

        TestBed.overrideProvider(NOTE_EDITOR_SNIPPET_CONFIG, {
            useValue: newConfig,
        });
    };

    const createFixture = () => {
        fixture = TestBed.createComponent(NoteCodeEditorSnippetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    };

    beforeEach(() => {
        ref = new NoteEditorSnippetRef();
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
                ],
                providers: [
                    MonacoService,
                    StackViewer,
                    { provide: NOTE_EDITOR_SNIPPET_REF, useValue: ref },
                    { provide: NOTE_EDITOR_SNIPPET_CONFIG, useValue: config },
                ],
                declarations: [NoteCodeEditorSnippetComponent],
            })
            .compileComponents();
    }));

    afterEach(() => {
        // I don't know why this happens, but element remains after the test has ended.
        // Clear the fixture so that no elements remain.
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
        });

        it('should fire \'REMOVE_THIS\' event when press a backspace with a blank value', () => {
            const inputField = getInputField();
            const eventCallback = jasmine.createSpy('eventCallback');

            component.setValue('');
            component._ref.events().subscribe(eventCallback);

            dispatchKeyboardEvent(inputField, 'keydown', KeyCodes.BACKSPACE);

            expect(eventCallback).toHaveBeenCalledWith(new NoteEditorSnippetEvent(
                NoteEditorSnippetEventNames.REMOVE_THIS, component._ref));
        });

        it('should fire \'MOVE_FOCUS_TO_PREVIOUS\' event when press a up arrow ' +
            'and current cursor in top of lines.', () => {

            const inputField = getInputField();
            const eventCallback = jasmine.createSpy('eventCallback');

            component.setPositionToTop();
            component._ref.events().subscribe(eventCallback);

            dispatchKeyboardEvent(inputField, 'keydown', KeyCodes.UP_ARROW);

            expect(eventCallback).toHaveBeenCalledWith(new NoteEditorSnippetEvent(
                NoteEditorSnippetEventNames.MOVE_FOCUS_TO_PREVIOUS, component._ref));
        });

        it('should fire \'MOVE_FOCUS_TO_NEXT\' event when press a down arrow ' +
            'and current cursor in bottom of lines.', () => {

            const inputField = getInputField();
            const eventCallback = jasmine.createSpy('eventCallback');

            component.setPositionToBottom();
            component._ref.events().subscribe(eventCallback);

            dispatchKeyboardEvent(inputField, 'keydown', KeyCodes.DOWN_ARROW);

            expect(eventCallback).toHaveBeenCalledWith(new NoteEditorSnippetEvent(
                NoteEditorSnippetEventNames.MOVE_FOCUS_TO_NEXT, component._ref));
        });
    });

    describe('isFirstSnippet', () => {
        beforeEach(() => {
            overrideConfig({ isNewSnippet: true });
            createFixture();
        });

        it('should setting form appeared.', () => {
            const settingForm = fixture.debugElement.query(
                By.css('.NoteCodeEditorSnippet__settingForm'));

            expect(settingForm).not.toBeNull();
            expect(component.mode).toEqual('setting');
        });

        it('should cancel button on setting form not appeared.', () => {
            const settingForm = fixture.debugElement.query(
                By.css('.NoteCodeEditorSnippet__settingForm'));
            const cancelButton = settingForm.query(
                By.css('button[aria-label=cancel-button]'));

            expect(cancelButton).toBeNull();
        });

        it('should got error message when language input is empty.', () => {
            const settingForm = fixture.debugElement.query(
                By.css('.NoteCodeEditorSnippet__settingForm'));
            const languageInputEl = fixture.debugElement.query(
                By.css('input[name=language]')).nativeElement;

            typeInElement('abc', languageInputEl);
            fixture.detectChanges();

            typeInElement('', languageInputEl);
            fixture.detectChanges();

            verifyFormFieldError(
                settingForm,
                'required',
                'Code language required!',
            );
        });

        it('should input language from input control.', fakeAsync(() => {
            const languageInputEl = fixture.debugElement.query(
                By.css('input[name=language]')).nativeElement;

            dispatchFakeEvent(languageInputEl, 'focusin');
            fixture.detectChanges();

            typeInElement('ho', languageInputEl);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            dispatchKeyboardEvent(languageInputEl, 'keydown', KeyCodes.DOWN_ARROW);
            fixture.detectChanges();

            dispatchKeyboardEvent(languageInputEl, 'keydown', KeyCodes.ENTER);
            fixture.detectChanges();

            expect(languageInputEl.value).toContain('ho');
        }));
    });
});
