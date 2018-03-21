import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Injector,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import * as CodeMirror from 'codemirror';
import 'codemirror/mode/markdown/markdown';
import { NoteEditorSnippet } from './snippet';


/**
 * Use `CodeMirror` as editor.
 * Editor for markdown text.
 */
@Component({
    selector: 'gd-note-editor-text-snippet',
    templateUrl: './text-snippet.component.html',
    styleUrls: ['./text-snippet.component.less'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteTextEditorSnippetComponent extends NoteEditorSnippet {
    @ViewChild('content') contentEl: ElementRef;
    _editor: CodeMirror.Editor; // Define as public to be useful in testing.

    private keyDownEventListener: any;
    private focusEventListener: any;
    private blurEventListener: any;

    constructor(private injector: Injector) {
        super(injector);
    }

    init(): void {
        this._editor = CodeMirror(this.contentEl.nativeElement, this.getEditorOptions());

        this.keyDownEventListener = (_, event: KeyboardEvent) => {
            this.handleKeyDown(event);
        };

        this.focusEventListener = () => {
            this.handleFocus(true);
        };

        this.blurEventListener = () => {
            this.handleFocus(false);
        };

        this._editor.on('keydown', this.keyDownEventListener);
        this._editor.on('focus', this.focusEventListener);
        this._editor.on('blur', this.blurEventListener);
    }

    destroy(): void {
        this._editor.off('keydown', this.keyDownEventListener);
        this._editor.off('focus', this.focusEventListener);
        this._editor.off('blur', this.blurEventListener);
    }

    getValue(): string {
        return this._editor.getDoc().getValue();
    }

    setValue(value: string): void {
        this._editor.getDoc().setValue(value);
    }

    focus(): void {
        this._editor.focus();
    }

    hasFocusOnEditor(): boolean {
        return this._editor.hasFocus();
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

    getEditorOptions(): CodeMirror.EditorConfiguration {
        return {
            value: this._config.initialValue,
            mode: 'markdown',
            indentUnit: 4,
            lineWrapping: true,
            lineNumbers: false,
            scrollbarStyle: 'null',
            autofocus: true,
        };
    }
}
