import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Injector,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { MonacoService } from '../../../core/monaco.service';
import { Stack } from '../../../stack/models';
import { StackViewer } from '../../../stack/stack-viewer';
import { UpdateSnippetContentAction } from '../../actions';
import { NoteEditorSnippet } from './snippet';


@Component({
    selector: 'gd-note-editor-code-snippet',
    templateUrl: './code-snippet.component.html',
    styleUrls: ['./code-snippet.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class NoteEditorCodeSnippetComponent extends NoteEditorSnippet implements OnInit {
    settingForm = new FormGroup({
        language: new FormControl('', [Validators.required]),
        fileName: new FormControl('', [Validators.required]),
    });
    mode: 'edit' | 'setting' = 'edit';
    filteredStacks: Observable<Stack[]>;
    languageStack: Stack | null = null;

    @ViewChild('wrapper') wrapperEl: ElementRef;
    @ViewChild('content') contentEl: ElementRef;
    _editor: monaco.editor.IStandaloneCodeEditor;

    constructor(
        injector: Injector,
        private monacoService: MonacoService,
        private stackViewer: StackViewer,
    ) {

        super(injector);
    }

    ngOnInit(): void {
        this.applyStack();

        if (this._config.isNewSnippet) {
            this.turnSettingModeOn();
        }

        this.filteredStacks =
            this.stackViewer.searchAsObservable(
                this.settingForm.get('language').valueChanges,
            );
    }

    init(): void {
        this._editor = this.monacoService.createEditor(
            this.contentEl.nativeElement, this.getEditorOptions());

        this._editor.onDidFocusEditor(() => {
            this.handleFocus(true);
            this.layoutHeight();
        });

        this._editor.onDidBlurEditor(() => {
            this.handleFocus(false);
            this.layoutHeight();
        });

        this._editor.onDidChangeModelContent(() => {
            this.handleValueChanged(this.getValue());
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
        if (this._editor) {
            // this._editor.dispose();
        }
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
        if (!this._editor) {
            return false;
        }

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

    turnSettingModeOn(): void {
        this.mode = 'setting';
        this.settingForm.setValue({
            language: this._config.language ? this._config.language : '',
            fileName: this._config.fileName ? this._config.fileName : '',
        }, { emitEvent: false });
    }

    submitSetting(): void {
        const settings = this.settingForm.value;

        this._config.language = settings.language;
        this._config.fileName = settings.fileName;

        this.monacoService.updateEditorLanguage(
            this._editor,
            this._config.language,
        );

        this.store.dispatch(new UpdateSnippetContentAction({
            snippetId: this.id,
            patch: {
                language: this._config.language,
                fileName: this._config.fileName,
            },
        }));

        this.mode = 'edit';
        this.applyStack();
    }

    cancelSetting(): void {
        this.mode = 'edit';
    }

    canDisplayLanguageStackIcon(): boolean {
        return this.languageStack !== null && this.languageStack.icon !== null;
    }

    private layoutHeight(): void {
        const contentWidth = this.contentEl.nativeElement.clientWidth;
        const lineCount = this._editor.getModel().getLineCount();

        this._editor.layout({
            width: contentWidth,
            height: lineCount * this.getEditorOptions().lineHeight,
        });
    }

    private applyStack(): void {
        const language = this._config.language;

        this.languageStack = this.stackViewer.getStack(language);
    }

    protected handleFocus(focused: boolean) {
        super.handleFocus(focused);

        const className = 'NoteEditorCodeSnippet--focused';

        if (focused) {
            this.wrapperEl.nativeElement.classList.add(className);
        } else {
            this.wrapperEl.nativeElement.classList.remove(className);
        }
    }
}
