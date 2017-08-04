import { Component, ElementRef, EventEmitter, OnInit, Input, Output } from '@angular/core';


@Component({
    selector: 'app-note-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.less']
})
export class NoteEditorComponent implements OnInit {
    @Output() bodyChange = new EventEmitter();
    @Input() initBody = '';
    editor: any;

    constructor(private elemRef: ElementRef) {
    }

    ngOnInit() {
        if (global['monaco']) {
            this.createEditor();
        } else {
            global['onEditorLibLoaded'] = () => this.createEditor();
        }
    }

    createEditor() {
        const containerElem = this.elemRef.nativeElement.children[0].children[0];
        const monaco = global['monaco'];

        this.editor = monaco.editor.create(containerElem, {
            automaticLayout: true,
            ariaLabel: 'editor-snippet',
            autoIndent: true,
            fontFamily: '"Open Sans", sans-serif',
            fontSize: 16,
            language: 'markdown',
            lineHeight: 24,
            minimap: {
                enabled: false
            },
            scrollbar: {
                vertical: 'hidden',
                horizontal: 'hidden',
                handleMouseWheel: false
            },
            scrollBeyondLastLine: false,
            stopRenderingLineAfter: 100,
            overviewRulerBorder: false,
            overviewRulerLanes: 0,
            wordWrap: 'on',
            value: '123',
            renderIndentGuides: true
        });

        this.editor.onDidChangeModelContent(() => {
            // const height = this.editor.getScrollHeight();
            // const containerHeight = containerElem.getBoundingClientRect().height;

            const value = this.editor.getValue();
            const lines = value.split('\n');

            containerElem.style.height = `${24 * (lines.length + 1) + 2}px`;

            /*
            if (containerHeight - height <= 25) {
                containerElem.style.height = `${height + 24}px`;
            }
            */
        });
    }
}
