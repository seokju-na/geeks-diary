import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { NoteSnippetContent } from '../shared/note-content.model';
import { CodeMirrorEditorConfiguration, NoteSnippetCodeMirrorEditor } from './note-snippet-code-mirror-editor';
import { NoteSnippetEditorConfig } from './note-snippet-editor-config';
import { NoteSnippetEditorEvent } from './note-snippet-editor-events';


const FOCUSED_CLASS_NAME = 'NoteTextSnippetEditor--focused';


@Component({
    selector: 'gd-note-text-snippet-editor',
    templateUrl: './note-text-snippet-editor.component.html',
    styleUrls: ['./note-text-snippet-editor.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'class': 'NoteTextSnippetEditor',
    },
})
export class NoteTextSnippetEditorComponent extends NoteSnippetCodeMirrorEditor {
    @Input() content: NoteSnippetContent;
    @Input() config: NoteSnippetEditorConfig;
    @Output() readonly events = new EventEmitter<NoteSnippetEditorEvent>();

    @ViewChild('editor') editorHostEl: ElementRef;

    constructor(public _elementRef: ElementRef) {
        super();
    }

    getEditorOptions(): CodeMirrorEditorConfiguration {
        return {
            value: this.content.value,
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
        const hostEl = this.getHostElement();

        if (focused) {
            if (!hostEl.classList.contains(FOCUSED_CLASS_NAME)) {
                hostEl.classList.add(FOCUSED_CLASS_NAME);
            }
        } else {
            if (hostEl.classList.contains(FOCUSED_CLASS_NAME)) {
                hostEl.classList.remove(FOCUSED_CLASS_NAME);
            }
        }
    }

    private getHostElement(): HTMLElement {
        return this._elementRef.nativeElement as HTMLElement;
    }
}
