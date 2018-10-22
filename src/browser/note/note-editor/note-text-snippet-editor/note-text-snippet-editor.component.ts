import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewEncapsulation } from '@angular/core';
import { CodeMirrorEditorConfiguration, NoteSnippetCodeMirrorEditor } from '../note-snippet-code-mirror-editor';
import { NoteSnippetEditorConfig, NoteSnippetEditorRef } from '../note-snippet-editor';


@Component({
    selector: 'gd-note-text-snippet-editor',
    templateUrl: './note-text-snippet-editor.component.html',
    styleUrls: ['./note-text-snippet-editor.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        'class': 'NoteTextSnippetEditor',
    },
})
export class NoteTextSnippetEditorComponent extends NoteSnippetCodeMirrorEditor implements OnInit {
    editorHostEl: HTMLElement;

    private focused: boolean = false;

    constructor(
        ref: NoteSnippetEditorRef<NoteTextSnippetEditorComponent>,
        config: NoteSnippetEditorConfig,
        private elementRef: ElementRef<HTMLElement>,
    ) {
        super(ref, config);
    }

    ngOnInit(): void {
        this.editorHostEl = this.elementRef.nativeElement.querySelector('.NoteTextSnippetEditor__editor');
        super.ngOnInit();
    }

    getEditorOptions(): CodeMirrorEditorConfiguration {
        return {
            value: this._config.value,
            mode: 'markdown',
            indentUnit: 4,
            lineWrapping: true,
            lineNumbers: false,
            scrollbarStyle: 'null',
            autofocus: false,
            viewportMargin: Infinity,
            extraKeys: {
                Enter: 'newlineAndIndentContinueMarkdownList',
                Tab: 'autoIndentMarkdownList',
                'Shift-Tab': 'autoUnindentMarkdownList',
            },

        };
    }

    handleFocus(focused: boolean): void {
        this.focused = focused;

        const hostEl = this.elementRef.nativeElement;
        const focusedClassName = 'NoteTextSnippetEditor--focused';

        if (this.focused && !hostEl.classList.contains(focusedClassName)) {
            hostEl.classList.add(focusedClassName);
        } else if (!this.focused && hostEl.classList.contains(focusedClassName)) {
            hostEl.classList.remove(focusedClassName);
        }
    }
}
