import { BACKSPACE, DOWN_ARROW, UP_ARROW } from '@angular/cdk/keycodes';
import { Component, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { dispatchKeyboardEvent, fastTestSetup } from '../../../../test/helpers';
import { CodeMirrorEditorConfiguration, NoteSnippetCodeMirrorEditor } from './note-snippet-code-mirror-editor';
import {
    NoteSnippetEditorBlurredEvent,
    NoteSnippetEditorConfig,
    NoteSnippetEditorFocusedEvent,
    NoteSnippetEditorMoveFocusToNextEvent,
    NoteSnippetEditorMoveFocusToPreviousEvent,
    NoteSnippetEditorRef,
    NoteSnippetEditorRemoveThisEvent,
} from './note-snippet-editor';


@Component({
    template: '<div id="editor"></div>',
})
class NoteSnippetCodeMirrorEditorTestComponent extends NoteSnippetCodeMirrorEditor {
    editorHostEl: HTMLElement;

    constructor(
        ref: NoteSnippetEditorRef<NoteSnippetCodeMirrorEditorTestComponent>,
        config: NoteSnippetEditorConfig,
        private elementRef: ElementRef<HTMLElement>,
    ) {
        super(ref, config);

        this.editorHostEl = this.elementRef.nativeElement.querySelector('#editor') as HTMLElement;
    }

    getEditorOptions(): CodeMirrorEditorConfiguration {
        return {
            value: this._config.value,
        };
    }

    handleFocus(focused: boolean): void {
    }
}


describe('browser.note.noteEditor.NoteSnippetCodeMirrorEditor', () => {
    let fixture: ComponentFixture<NoteSnippetCodeMirrorEditorTestComponent>;
    let component: NoteSnippetCodeMirrorEditorTestComponent;

    fastTestSetup();

    beforeAll(async () => {
        const config = new NoteSnippetEditorConfig();
        const ref = new NoteSnippetEditorRef(config);

        await TestBed
            .configureTestingModule({
                providers: [
                    { provide: NoteSnippetEditorRef, useValue: ref },
                    { provide: NoteSnippetEditorConfig, useValue: config },
                ],
                declarations: [
                    NoteSnippetCodeMirrorEditorTestComponent,
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(NoteSnippetCodeMirrorEditorTestComponent);
        component = fixture.componentInstance;
        component._ref.componentInstance = component;
    });

    describe('initialize', () => {
        it('should code mirror editor be exists after \'ngOnInit\'.', () => {
            fixture.detectChanges();
            expect(component._editor).toBeDefined();
        });

        it('should send event through after \'ngOnInit\'.', () => {
            const afterInitializedCallback = jasmine.createSpy('after initialized callback');
            const subscription = component._ref.afterInitialized().subscribe(afterInitializedCallback);

            fixture.detectChanges();

            expect(afterInitializedCallback).toHaveBeenCalled();
            subscription.unsubscribe();
        });

        it('should create editor with initial value.', () => {
            component._config.value = 'initial value';
            fixture.detectChanges();

            expect(component.getRawValue()).toEqual('initial value');
        });
    });

    describe('isCurrentPositionTop', () => {
        it('should be \'true\' when cursor in the start line of editor.', () => {
            fixture.detectChanges();

            component._editor.getDoc().setCursor({ line: 0, ch: 0 });

            expect(component.isCurrentPositionTop()).toBe(true);
        });
    });

    describe('isCurrentPositionBottom', () => {
        it('if editor has only one line, it should be true on both top and bottom.', () => {
            fixture.detectChanges();

            expect(component.isCurrentPositionTop()).toBe(true);
            expect(component.isCurrentPositionBottom()).toBe(true);
        });

        it('should be \'true\' when cursor in the last line of editor.', () => {
            component._config.value = 'hello\nworld!';
            fixture.detectChanges();

            component._editor.getDoc().setCursor({ line: 1, ch: 0 });

            expect(component.isCurrentPositionBottom()).toBe(true);
        });
    });

    describe('setPositionToTop(): void', () => {
        it('should cursor located at first line.', () => {
            component._config.value = 'Some long\nparagraph';
            fixture.detectChanges();

            component._editor.getDoc().setCursor({ line: 1, ch: 0 });
            expect(component.isCurrentPositionTop()).toBe(false);

            component.setPositionToTop();
            expect(component.isCurrentPositionTop()).toBe(true);
        });
    });

    describe('setPositionToBottom(): void', () => {
        it('should cursor located at last line.', () => {
            component._config.value = 'Some long\nparagraph';
            fixture.detectChanges();

            expect(component.isCurrentPositionBottom()).toBe(false);

            component.setPositionToBottom();
            expect(component.isCurrentPositionBottom()).toBe(true);
        });
    });

    describe('typing', () => {
        it('should fire \'REMOVE_THIS\' event when press a backspace with a blank value', () => {
            const callback = jasmine.createSpy('events callback');
            const subscription = component._ref.events.asObservable().subscribe(callback);

            fixture.detectChanges();
            component.setRawValue('');

            dispatchKeyboardEvent(component._editor.getInputField(), 'keydown', BACKSPACE);

            expect(callback).toHaveBeenCalledWith(new NoteSnippetEditorRemoveThisEvent(component._ref));
            subscription.unsubscribe();
        });

        it('should fire \'MOVE_FOCUS_TO_PREVIOUS\' event when press a up arrow and current cursor in '
            + 'top of lines.', () => {
            const callback = jasmine.createSpy('events callback');
            const subscription = component._ref.events.asObservable().subscribe(callback);

            fixture.detectChanges();
            component.setPositionToTop();

            dispatchKeyboardEvent(component._editor.getInputField(), 'keydown', UP_ARROW);

            expect(callback).toHaveBeenCalledWith(
                new NoteSnippetEditorMoveFocusToPreviousEvent(component._ref),
            );
            subscription.unsubscribe();
        });

        it('should fire \'MOVE_FOCUS_TO_NEXT\' event when press a down arrow and current cursor in '
            + 'bottom of lines.', () => {
            const callback = jasmine.createSpy('events callback');
            const subscription = component._ref.events.asObservable().subscribe(callback);

            component._config.value = 'Two\nLine';
            fixture.detectChanges();

            component.setPositionToBottom();
            dispatchKeyboardEvent(component._editor.getInputField(), 'keydown', DOWN_ARROW);

            expect(callback).toHaveBeenCalledWith(
                new NoteSnippetEditorMoveFocusToNextEvent(component._ref),
            );
            subscription.unsubscribe();
        });
    });

    /**
     * TODO : Hack code mirror editor focus mechanism.
     */
    xdescribe('handle focus', () => {
        it('should fire \'FOCUSED\' event when editor focused.', () => {
            const callback = jasmine.createSpy('events callback');
            const subscription = component._ref.events.asObservable().subscribe(callback);

            spyOn(component, 'handleFocus');

            fixture.detectChanges();
            component._editor.getInputField().focus();

            expect(callback).toHaveBeenCalledWith(new NoteSnippetEditorFocusedEvent(component._ref));
            expect(component.handleFocus).toHaveBeenCalledWith(true);
            subscription.unsubscribe();
        });

        it('should fire \'BLURRED\' event when editor blurred.', () => {
            fixture.detectChanges();
            component._editor.focus();

            const callback = jasmine.createSpy('events callback');
            const subscription = component._ref.events.asObservable().subscribe(callback);

            spyOn(component, 'handleFocus');
            (document.activeElement as HTMLElement).blur();

            expect(callback).toHaveBeenCalledWith(new NoteSnippetEditorBlurredEvent(component._ref));
            expect(component.handleFocus).toHaveBeenCalledWith(false);
            subscription.unsubscribe();
        });
    });
});
