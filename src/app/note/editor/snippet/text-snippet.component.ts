import {
    ChangeDetectionStrategy,
    Component,
    ElementRef, Injector,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import * as CodeMirror from 'codemirror';
import 'codemirror/mode/markdown/markdown';
import { NoteEditorSnippet } from './snippet';


@Component({
    selector: 'gd-note-editor-text-snippet',
    templateUrl: './text-snippet.component.html',
    styleUrls: ['./text-snippet.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class NoteEditorTextSnippetComponent extends NoteEditorSnippet {
    @ViewChild('wrapper') wrapperEl: ElementRef;
    @ViewChild('content') contentEl: ElementRef;
    _editor: CodeMirror.Editor;

    private changeEventListener: any;
    private keyDownEventListener: any;
    private focusEventListener: any;
    private blurEventListener: any;

    constructor(injector: Injector) {
        super(injector);
    }

    init(): void {
        this._editor = CodeMirror(this.contentEl.nativeElement, this.getEditorOptions());

        this.changeEventListener = () => {
            this.handleValueChanged(this.getValue());
        };

        this.keyDownEventListener = (_, event: KeyboardEvent) => {
            this.handleKeyDown(event);
        };

        this.focusEventListener = () => {
            this.handleFocus(true);
        };

        this.blurEventListener = () => {
            this.handleFocus(false);
        };

        this._editor.on('change', this.changeEventListener);
        this._editor.on('keydown', this.keyDownEventListener);
        this._editor.on('focus', this.focusEventListener);
        this._editor.on('blur', this.blurEventListener);

        this._afterEditorInitialized.next();
        this._afterEditorInitialized.complete();
    }

    destroy(): void {
        if (this._editor) {
            this._editor.off('change', this.changeEventListener);
            this._editor.off('keydown', this.keyDownEventListener);
            this._editor.off('focus', this.focusEventListener);
            this._editor.off('blur', this.blurEventListener);
        }
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
        if (!this._editor) {
            return false;
        }

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
            autofocus: false,
            viewportMargin: Infinity,
        };
    }

    protected handleFocus(focused: boolean) {
        super.handleFocus(focused);

        const className = 'NoteEditorTextSnippet--focused';

        if (focused) {
            this.wrapperEl.nativeElement.classList.add(className);
        } else {
            this.wrapperEl.nativeElement.classList.remove(className);
        }
    }
}
