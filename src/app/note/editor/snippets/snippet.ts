import { AfterViewInit, ElementRef, HostBinding, HostListener, Injector, OnDestroy } from '@angular/core';
import { KeyCodes } from '../../../../common/key-codes';
import {
    NOTE_EDITOR_SNIPPET_CONFIG,
    NOTE_EDITOR_SNIPPET_REF,
    NoteEditorSnippetConfig,
} from './snippet-factory';
import {
    NoteEditorSnippetEvent,
    NoteEditorSnippetEventNames,
    NoteEditorSnippetRef,
} from './snippet-ref';


export abstract class NoteEditorSnippet implements OnDestroy, AfterViewInit {
    readonly _ref: NoteEditorSnippetRef;
    readonly _config: NoteEditorSnippetConfig;
    abstract contentEl: ElementRef;
    abstract _editor: any;

    @HostBinding('id')
    get id() {
        return this._ref.id;
    }

    constructor(injector: Injector) {
        this._ref = injector.get(NOTE_EDITOR_SNIPPET_REF);
        this._config = injector.get(NOTE_EDITOR_SNIPPET_CONFIG);

        this._ref.setSnippetInstance(this);
    }

    ngAfterViewInit(): void {
        this.init();
    }

    ngOnDestroy(): void {
        this.destroy();
        this._ref.remove();
    }

    /** Editor initialize method **/
    abstract init(): void;

    /**
     * Editor destroy method.
     * Can be used to remove event listener on editor.
     */
    abstract destroy(): void;

    abstract focus(): void;

    abstract getValue(): string;

    abstract setValue(value: string): void;

    abstract hasFocusOnEditor(): boolean;

    abstract isCurrentPositionTop(): boolean;

    abstract isCurrentPositionBottom(): boolean;

    abstract setPositionToTop(): void;

    abstract setPositionToBottom(): void;

    protected handleFocus(focused: boolean): void {
        if (focused) {
            this.emitEvent(NoteEditorSnippetEventNames.DID_FOCUS);
        } else {
            this.emitEvent(NoteEditorSnippetEventNames.DID_BLUR);
        }
    }

    protected handleKeyDown(event: KeyboardEvent): void {
        switch (event.keyCode) {
            case KeyCodes.BACKSPACE:
                if (this.getValue().trim() === '') {
                    this.emitEvent(NoteEditorSnippetEventNames.REMOVE_THIS);
                }
                break;

            case KeyCodes.UP_ARROW:
                if (this.isCurrentPositionTop()) {
                    this.emitEvent(NoteEditorSnippetEventNames.MOVE_FOCUS_TO_PREVIOUS);
                }
                break;

            case KeyCodes.DOWN_ARROW:
                if (this.isCurrentPositionBottom()) {
                    this.emitEvent(NoteEditorSnippetEventNames.MOVE_FOCUS_TO_NEXT);
                }
                break;
        }
    }

    protected emitEvent(name: NoteEditorSnippetEventNames): void {
        this._ref._events.next(new NoteEditorSnippetEvent(name, this._ref));
    }

    @HostListener('click')
    private focusViaHostElementClick(): void {
        this.focus();
    }
}
