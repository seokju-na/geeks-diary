/// <reference path="../../../../assets/vendors/monaco-editor/monaco.d.ts" />
import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NoteEditorSnippet } from './snippet';


@Component({
    selector: 'gd-note-editor-code-snippet',
    templateUrl: './code-snippet.component.html',
    styleUrls: ['./code-snippet.component.less'],
})
export class NoteCodeEditorSnippetComponent extends NoteEditorSnippet {
    @ViewChild('content') contentEl: ElementRef;

    private monaco: any;
    _editor: monaco.editor.IStandaloneCodeEditor;

    constructor(private injector: Injector) {
        super(injector);
    }

    init(): void {
        if ((<any>window).MONACO) {
            this.monaco = (<any>window).MONACO;
            this.createEditor();
        } else {
            (<any>window).REGISTER_MONACO_INIT_CALLBACK(() => {
                this.monaco = (<any>window).MONACO;
                this.createEditor();
            });
        }
    }

    destroy(): void {
    }

    focus(): void {
    }

    getValue(): string {
        return '';
    }

    setValue(value: string): void {
    }

    hasFocusOnEditor(): boolean {
        return false;
    }

    isCurrentPositionTop(): boolean {
        return false;
    }

    isCurrentPositionBottom(): boolean {
        return false;
    }

    setPositionToTop(): void {
    }

    setPositionToBottom(): void {
    }

    getEditorOptions(): monaco.editor.IEditorConstructionOptions {
        return {
            value: '',
            language: 'typescript',
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

    private createEditor(): void {
        this._editor = this.monaco.editor.create(
            this.contentEl.nativeElement, this.getEditorOptions());
    }
}
