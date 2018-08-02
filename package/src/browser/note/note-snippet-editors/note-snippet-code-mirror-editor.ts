import { ElementRef } from '@angular/core';
import * as CodeMirror from 'codemirror';
import { Editor, EditorConfiguration } from 'codemirror';
import { NoteSnippetEditor } from './note-snippet-editor';
import { NoteSnippetEditorEventNames } from './note-snippet-editor-events';

import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/continuelist.js';
import 'codemirror/addon/edit/indentlist.js';
import 'codemirror/addon/selection/active-line.js';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/markdown/markdown.js';


export type CodeMirrorEditor = Editor;
export type CodeMirrorEditorConfiguration = EditorConfiguration;


/**
 * Note snippet editor which editor implemented with 'CodeMirror'.
 *
 * Yet still abstract. Concrete this class on component which you
 * want to use this editor.
 *
 * See also:
 *  ./note-code-snippet-editor.component.ts
 *  ./note-text-snippet-editor.component.ts
 */
export abstract class NoteSnippetCodeMirrorEditor extends NoteSnippetEditor<CodeMirrorEditor> {
    _editor: CodeMirrorEditor;
    abstract editorHostEl: ElementRef;

    private changeEventListener: () => void;
    private keyDownEventListener: (_: any, event: KeyboardEvent) => void;
    private focusEventListener: () => void;
    private blurEventListener: () => void;

    abstract getEditorOptions(): CodeMirrorEditorConfiguration;

    initialize(): void {
        this._editor = CodeMirror(
            this.editorHostEl.nativeElement,
            this.getEditorOptions(),
        );

        this.changeEventListener = () => {
            this.emitEvent(NoteSnippetEditorEventNames.VALUE_CHANGED);
        };

        this.keyDownEventListener = (_, event: KeyboardEvent) => {
            this.onKeyDown(event);
        };

        this.focusEventListener = () => {
            this.handleFocus(true);
            this.emitEvent(NoteSnippetEditorEventNames.FOCUSED);
        };

        this.blurEventListener = () => {
            this.handleFocus(false);
            this.emitEvent(NoteSnippetEditorEventNames.BLURRED);
        };

        this._editor.on('change', this.changeEventListener);
        this._editor.on('keydown', this.keyDownEventListener);
        this._editor.on('focus', this.focusEventListener);
        this._editor.on('blur', this.blurEventListener);
    }

    dispose(): void {
        if (this._editor) {
            this._editor.off('change', this.changeEventListener);
            this._editor.off('keydown', this.keyDownEventListener);
            this._editor.off('focus', this.focusEventListener);
            this._editor.off('blur', this.blurEventListener);
        }
    }

    focus(): void {
        this._editor.focus();
    }

    blur(): void {
        if (this._editor.hasFocus() && document.activeElement) {
            (document.activeElement as HTMLElement).blur();
        }
    }

    getRawValue(): string {
        return this._editor.getDoc().getValue();
    }

    setRawValue(value: string): void {
        this._editor.getDoc().setValue(value);
    }

    isCurrentPositionTop(): boolean {
        const { line } = this._editor.getDoc().getCursor();

        return line === 0;
    }

    isCurrentPositionBottom(): boolean {
        const doc = this._editor.getDoc();
        const { line } = doc.getCursor();

        return line === doc.lastLine();
    }

    setPositionToTop(): void {
        this._editor.getDoc().setCursor({ line: 0, ch: 0 });
    }

    setPositionToBottom(): void {
        const doc = this._editor.getDoc();

        doc.setCursor({ line: doc.lastLine(), ch: 0 });
    }

    abstract handleFocus(focused: boolean): void;
}
