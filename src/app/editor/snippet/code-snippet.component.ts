import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Injector,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MonacoService } from '../../core/monaco.service';
import { EditorSnippet } from './snippet';


@Component({
    selector: 'gd-editor-code-snippet',
    templateUrl: './code-snippet.component.html',
    styleUrls: ['./code-snippet.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class EditorCodeSnippetComponent extends EditorSnippet {
    @ViewChild('content') contentEl: ElementRef;
    _editor: monaco.editor.IStandaloneCodeEditor;

    constructor(
        injector: Injector,
        private monacoService: MonacoService,
    ) {

        super(injector);
    }

    init(): void {
        this._editor = this.monacoService.createEditor(
            this.contentEl.nativeElement, this.getEditorOptions());

        this._editor.onDidFocusEditor(() => {
            this.handleFocus(true);
        });

        this._editor.onDidBlurEditor(() => {
            this.handleFocus(false);
        });

        this._editor.onDidChangeModelContent(() => {
            // const value = this._editor.getModel().getValue();
            // this.emitEvent();
            this.layoutHeight();
        });

        this._editor.onKeyDown((event: monaco.IKeyboardEvent) => {
            this.handleKeyDown(event.browserEvent);
        });

        this._editor.createContextKey('alwaysTrue', true);

        const keyMod = this.monacoService.KeyMod;
        const keyCode = this.monacoService.KeyCode;

        /* tslint:disable */
        this._editor.addCommand(keyMod.CtrlCmd | keyCode.KEY_F, () => {}, 'alwaysTrue');
        /* tslint:enable */

        this.layoutHeight();
    }

    destroy(): void {
        this._editor.dispose();
    }

    focus(): void {
        this._editor.focus();
    }

    getValue(): string {
        return this._editor.getValue();
    }

    getLanguage(): string {
        // Method name is little bit strange(...)
        return this._editor.getModel().getModeId();
    }

    setValue(value: string): void {
        this._editor.setValue(value);
    }

    hasFocusOnEditor(): boolean {
        return this._editor.isFocused();
    }

    isCurrentPositionTop(): boolean {
        const { lineNumber } = this._editor.getPosition();

        return lineNumber === 1;
    }

    isCurrentPositionBottom(): boolean {
        const { lineNumber } = this._editor.getPosition();
        const lineCount = this._editor.getModel().getLineCount();

        return lineNumber === lineCount;
    }

    setPositionToTop(): void {
        this._editor.setPosition({
            column: 0,
            lineNumber: 1,
        });
    }

    setPositionToBottom(): void {
        const lineCount = this._editor.getModel().getLineCount();

        this._editor.setPosition({
            column: 0,
            lineNumber: lineCount,
        });
    }

    getEditorOptions(): monaco.editor.IEditorConstructionOptions {
        return {
            value: this._config.initialValue,
            language: this._config.language ? this._config.language : null,
            codeLens: false,
            fontSize: 14,
            lineHeight: 21,
            glyphMargin: false,
            minimap: {
                enabled: false,
            },
            overviewRulerLanes: 0,
            overviewRulerBorder: false,
            contextmenu: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            roundedSelection: false,
            renderLineHighlight: 'none',
        };
    }

    submitSetting(): void {
    }

    private layoutHeight(): void {
        const contentWidth = this.contentEl.nativeElement.clientWidth;
        const lineCount = this._editor.getModel().getLineCount();

        this._editor.layout({
            width: contentWidth,
            height: lineCount * this.getEditorOptions().lineHeight + 10,
        });
    }
}
