import { BACKSPACE } from '@angular/cdk/keycodes';
import { HostBinding, OnDestroy, OnInit } from '@angular/core';


/**
 * Abstraction of note snippet editor.
 * Generic T should be instance of editor which you will be implement.
 */
export abstract class NoteSnippetEditor<T = any> implements OnInit, OnDestroy {
    abstract editor: T;

    /** ID for the snippet editor DOM element. */
    @HostBinding('id') _id: string;

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
                    //
                }
                break;
        }
    }
}
