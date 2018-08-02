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
import { EditorConfiguration } from 'codemirror';
import { NoteSnippetContent } from '../shared/note-content.model';
import { NoteSnippetCodeMirrorEditor } from './note-snippet-code-mirror-editor';
import { NoteSnippetEditorConfig } from './note-snippet-editor-config';
import { NoteSnippetEditorEvent } from './note-snippet-editor-events';


const FOCUSED_CLASS_NAME = 'NoteCodeSnippetEditor--focused';


@Component({
    selector: 'gd-note-code-snippet-editor',
    templateUrl: './note-code-snippet-editor.component.html',
    styleUrls: ['./note-code-snippet-editor.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'class': 'NoteCodeSnippetEditor',
    },
})
export class NoteCodeSnippetEditorComponent extends NoteSnippetCodeMirrorEditor {
    @Input() content: NoteSnippetContent;
    @Input() config: NoteSnippetEditorConfig;
    @Output() readonly events = new EventEmitter<NoteSnippetEditorEvent>();

    @ViewChild('editor') editorHostEl: ElementRef;

    constructor(public _elementRef: ElementRef) {
        super();
    }

    getEditorOptions(): EditorConfiguration {
        return {
            value: this.content.value,
            // TODO : Integrate with stack module
            mode: {
                name: 'javascript',
                typescript: true,
            },
            indentUnit: 4,
            lineWrapping: false,
            lineNumbers: true,
            scrollbarStyle: 'null',
            autofocus: false,
            viewportMargin: Infinity,
        };
    }

    initialize(): void {
        super.initialize();

        this._editor.setOption('autoCloseBrackets', true);

        this._editor.on('focus', () => {
            this._editor.setOption('styleActiveLine', true);
        });

        this._editor.on('blur', () => {
            this._editor.setOption('styleActiveLine', false);
        });
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
