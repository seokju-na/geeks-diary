import { BACKSPACE, DOWN_ARROW, ENTER, UP_ARROW } from '@angular/cdk/keycodes';
import { EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { NoteSnippetContent } from '../shared/note-content.model';
import { NoteSnippetEditorConfig } from './note-snippet-editor-config';
import { NoteSnippetEditorEvent, NoteSnippetEditorEventNames } from './note-snippet-editor-events';


/**
 * Abstraction of note snippet editor.
 */
export abstract class NoteSnippetEditor<T = any> implements OnInit, OnDestroy {
    abstract _editor: T;

    /**
     * Note snippet content use to initialize editor component.
     *
     * This is will not affect to editor any behaviours after component
     * initialized.
     */
    abstract content: NoteSnippetContent;

    /**
     * Note snippet editor configuration use to initialize editor component.
     *
     * This is will not affect to editor any behaviours after component
     * initialized.
     */
    abstract config: NoteSnippetEditorConfig;

    abstract readonly events: EventEmitter<NoteSnippetEditorEvent>;

    ngOnInit(): void {
        this.initialize();
    }

    ngOnDestroy(): void {
        if (this.dispose) {
            this.dispose();
        }
    }

    /**
     * Call when component initialized.
     * Implementation should create editor in this method.
     */
    abstract initialize(): void;

    /** Call when component destroyed */
    abstract dispose?(): void;

    /** Focus editor manually */
    abstract focus(): void;

    /** Blur editor manually */
    abstract blur(): void;

    /** Get raw value of editor */
    abstract getRawValue(): string;

    /** Set raw value of editor */
    abstract setRawValue(value: string): void;

    /** Get code language id */
    getCodeLanguageId?(): string;

    /** Get code file name */
    getCodeFileName?(): string;

    /** Determine if current position is top */
    abstract isCurrentPositionTop(): boolean;

    /** Determine if current position is bottom */
    abstract isCurrentPositionBottom(): boolean;

    /** Set position to top */
    abstract setPositionToTop(): void;

    /** Set position to bottom */
    abstract setPositionToBottom(): void;

    /** Handle key down */
    protected onKeyDown(event: KeyboardEvent): void {
        switch (event.keyCode) {
            case BACKSPACE:
                if (this.getRawValue().trim() === '') {
                    this.emitEvent(NoteSnippetEditorEventNames.REMOVE_THIS);
                }
                break;

            case UP_ARROW:
                if (this.isCurrentPositionTop()) {
                    this.emitEvent(NoteSnippetEditorEventNames.MOVE_FOCUS_TO_PREVIOUS);
                }
                break;

            case DOWN_ARROW:
                if (this.isCurrentPositionBottom()) {
                    this.emitEvent(NoteSnippetEditorEventNames.MOVE_FOCUS_TO_NEXT);
                }
                break;

            case ENTER:
                if (event.shiftKey) {
                    event.preventDefault();

                    this.emitEvent(
                        NoteSnippetEditorEventNames.INSERT_NEW_SNIPPET_AFTER_THIS,
                    );
                }
        }
    }

    protected emitEvent(name: NoteSnippetEditorEventNames): void {
        this.events.emit(new NoteSnippetEditorEvent(name, this));
    }
}
