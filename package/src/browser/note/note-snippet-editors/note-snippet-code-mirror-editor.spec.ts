import { BACKSPACE, DOWN_ARROW, ENTER, UP_ARROW } from '@angular/cdk/keycodes';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { dispatchEvent, dispatchKeyboardEvent } from '../../../../test/helpers/dispatch-event';
import { createKeyboardEvent } from '../../../../test/helpers/event-objects';
import { typeInElement } from '../../../../test/helpers/type-in-element';
import { NoteSnippetContentDummy } from '../dummies';
import { NoteSnippetContent } from '../shared/note-content.model';
import { CodeMirrorEditorConfiguration, NoteSnippetCodeMirrorEditor } from './note-snippet-code-mirror-editor';
import { NoteSnippetEditorConfig } from './note-snippet-editor-config';
import { NoteSnippetEditorEvent, NoteSnippetEditorEventNames } from './note-snippet-editor-events';


@Component({
    template: '<div #editor></div>',
})
class NoteSnippetCodeMirrorEditorTestComponent
    extends NoteSnippetCodeMirrorEditor {

    @Input() content: NoteSnippetContent;
    @Input() config: NoteSnippetEditorConfig;
    @Output() readonly events = new EventEmitter<NoteSnippetEditorEvent>();
    @ViewChild('editor') editorHostEl: ElementRef;

    getEditorOptions(): CodeMirrorEditorConfiguration {
        return {
            value: this.content.value,
        };
    }

    handleFocus(focused: boolean): void {
    }
}


describe('browser.note.NoteSnippetCodeMirrorEditor', () => {
    let fixture: ComponentFixture<NoteSnippetCodeMirrorEditorTestComponent>;
    let component: NoteSnippetCodeMirrorEditorTestComponent;

    beforeEach(async(() => {
        TestBed
            .configureTestingModule({
                declarations: [NoteSnippetCodeMirrorEditorTestComponent],
            })
            .compileComponents();
    }));

    let content: NoteSnippetContent;

    function createFixture(): void {
        fixture = TestBed.createComponent(NoteSnippetCodeMirrorEditorTestComponent);
        component = fixture.componentInstance;
        component.content = content;
        fixture.detectChanges();
    }

    beforeEach(() => {
        content = new NoteSnippetContentDummy().create();
    });

    it('should initialize editor after \'ngOnInit\' life-cycle.', () => {
        createFixture();

        expect(component._editor).toBeDefined();
    });

    it('should initialized with snippet content value.', () => {
        createFixture();

        expect(component.getRawValue()).toContain(content.value);
    });

    it('should be true when cursor in the start line of editor.', () => {
        content = { ...content, value: 'double\nline' };
        createFixture();

        component._editor.getDoc().setCursor({ line: 0, ch: 0 });

        expect(component.isCurrentPositionTop()).toBe(true);
    });

    it('should be true when cursor in the last line of editor.', () => {
        content = { ...content, value: 'double\nline' };
        createFixture();

        component._editor.getDoc().setCursor({ line: 1, ch: 0 });

        expect(component.isCurrentPositionBottom()).toBe(true);
    });

    it('should be true on both top and bottom, if editor has only ' +
        'one line.', () => {
        content = { ...content, value: 'single line '};
        createFixture();

        expect(component.isCurrentPositionTop()).toBe(true);
        expect(component.isCurrentPositionBottom()).toBe(true);
    });

    it('should cursor located at first line.', () => {
        content = { ...content, value: 'double\nline '};
        createFixture();

        component._editor.getDoc().setCursor({ line: 1, ch: 0 });
        expect(component.isCurrentPositionTop()).toBe(false);

        component.setPositionToTop();
        expect(component.isCurrentPositionTop()).toBe(true);
    });

    it('should cursor located at last line.', () => {
        content = { ...content, value: 'double\nline '};
        createFixture();

        expect(component.isCurrentPositionBottom()).toBe(false);

        component.setPositionToBottom();
        expect(component.isCurrentPositionBottom()).toBe(true);
    });

    it('should dispatch \'REMOVE_THIS\' event when press a ' +
        'BACKSPACE key if editor value is empty.', () => {
        createFixture();

        const onEvent = jasmine.createSpy('events spy');
        const subscription = component.events.subscribe(onEvent);

        component.focus();
        component.setRawValue('');

        dispatchKeyboardEvent(
            component._editor.getInputField(),
            'keydown',
            BACKSPACE,
        );

        const event = onEvent.calls.mostRecent().args[0] as NoteSnippetEditorEvent;

        expect(event.name).toEqual(NoteSnippetEditorEventNames.REMOVE_THIS);
        expect(event.source).toEqual(component);

        subscription.unsubscribe();
    });

    it('should dispatch \'MOVE_FOCUS_TO_PREVIOUS\' event when press ' +
        'a UP_ARROW key if current cursor is in top of lines.', () => {
        createFixture();

        const onEvent = jasmine.createSpy('events spy');
        const subscription = component.events.subscribe(onEvent);

        // Should focus first.
        component.focus();
        component.setPositionToTop();

        dispatchKeyboardEvent(
            component._editor.getInputField(),
            'keydown',
            UP_ARROW,
        );

        const event = onEvent.calls.mostRecent().args[0] as NoteSnippetEditorEvent;

        expect(event.name)
            .toEqual(NoteSnippetEditorEventNames.MOVE_FOCUS_TO_PREVIOUS);
        expect(event.source).toEqual(component);

        subscription.unsubscribe();
    });

    it('should dispatch \'MOVE_FOCUS_TO_NEXT\' event when press ' +
        'a DOWN_ARROW key if current cursor is in bottom of lines.', () => {
        content = { ...content, value: 'double\nline' };
        createFixture();

        const onEvent = jasmine.createSpy('events spy');
        const subscription = component.events.subscribe(onEvent);

        // Should focus first.
        component.focus();
        component.setPositionToBottom();

        dispatchKeyboardEvent(
            component._editor.getInputField(),
            'keydown',
            DOWN_ARROW,
        );

        const event = onEvent.calls.mostRecent().args[0] as NoteSnippetEditorEvent;

        expect(event.name).toEqual(NoteSnippetEditorEventNames.MOVE_FOCUS_TO_NEXT);
        expect(event.source).toEqual(component);

        subscription.unsubscribe();
    });

    it('should dispatch \'VALUE_CHANGED\' event when input value.', () => {
        content = { ...content, value: '' };
        createFixture();

        const onEvent = jasmine.createSpy('events spy');
        const subscription = component.events.subscribe(onEvent);

        // Should focus first.
        component.focus();

        typeInElement('some value', component._editor.getInputField());
        fixture.detectChanges();

        const event = onEvent.calls.mostRecent().args[0] as NoteSnippetEditorEvent;

        expect(event.name).toEqual(NoteSnippetEditorEventNames.VALUE_CHANGED);
        expect(event.source).toEqual(component);

        subscription.unsubscribe();
    });

    it('should dispatch \'INSERT_NEW_SNIPPET_AFTER_THIS\' event ' +
        'when press ENTER key with shift key.', () => {
        createFixture();

        // Should focus first.
        component.focus();

        const onEvent = jasmine.createSpy('events spy');
        const subscription = component.events.subscribe(onEvent);

        const keyboardEvent = createKeyboardEvent('keydown', ENTER);

        Object.defineProperty(keyboardEvent, 'shiftKey', {
            get: () => true,
        });

        dispatchEvent(component._editor.getInputField(), keyboardEvent);

        const event = onEvent.calls.mostRecent().args[0] as NoteSnippetEditorEvent;

        expect(event.name)
            .toEqual(NoteSnippetEditorEventNames.INSERT_NEW_SNIPPET_AFTER_THIS);
        expect(event.source).toEqual(component);

        subscription.unsubscribe();
    });

    it('should dispatch \'FOCUSED\' event when editor have been ' +
        'focused.', () => {
        createFixture();

        if (document.activeElement) {
            (document.activeElement as HTMLElement).blur();
        }

        const onEvent = jasmine.createSpy('events spy');
        const subscription = component.events.subscribe(onEvent);

        component.focus();

        const event = onEvent.calls.mostRecent().args[0] as NoteSnippetEditorEvent;

        expect(event.name).toEqual(NoteSnippetEditorEventNames.FOCUSED);
        expect(event.source).toEqual(component);

        subscription.unsubscribe();
    });

    it('should dispatch \'BLURRED\' event when editor have been ' +
        'focused.', () => {
        createFixture();

        if (document.activeElement) {
            (document.activeElement as HTMLElement).blur();
        }

        component.focus();

        const onEvent = jasmine.createSpy('events spy');
        const subscription = component.events.subscribe(onEvent);

        component.blur();

        const event = onEvent.calls.mostRecent().args[0] as NoteSnippetEditorEvent;

        expect(event.name).toEqual(NoteSnippetEditorEventNames.BLURRED);
        expect(event.source).toEqual(component);

        subscription.unsubscribe();
    });
});
