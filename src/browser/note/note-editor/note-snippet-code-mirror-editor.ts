import * as CodeMirror from 'codemirror';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/continuelist.js';
import 'codemirror/addon/scroll/simplescrollbars.js';
import 'codemirror/addon/selection/active-line.js';
import 'codemirror/mode/apl/apl.js';
import 'codemirror/mode/asn.1/asn.1.js';
import 'codemirror/mode/clike/clike.js';
import 'codemirror/mode/clojure/clojure.js';
import 'codemirror/mode/cmake/cmake.js';
import 'codemirror/mode/css/css.js';
import 'codemirror/mode/d/d.js';
import 'codemirror/mode/dockerfile/dockerfile.js';
import 'codemirror/mode/dylan/dylan.js';
import 'codemirror/mode/ecl/ecl.js';
import 'codemirror/mode/elm/elm.js';
import 'codemirror/mode/fortran/fortran.js';
import 'codemirror/mode/groovy/groovy.js';
import 'codemirror/mode/haml/haml.js';
import 'codemirror/mode/handlebars/handlebars.js';
import 'codemirror/mode/haskell/haskell.js';
import 'codemirror/mode/htmlembedded/htmlembedded.js';
import 'codemirror/mode/htmlmixed/htmlmixed.js';
import 'codemirror/mode/http/http.js';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/jinja2/jinja2.js';
import 'codemirror/mode/markdown/markdown.js';
import 'codemirror/mode/nginx/nginx.js';
import 'codemirror/mode/octave/octave.js';
import 'codemirror/mode/oz/oz.js';
import 'codemirror/mode/pascal/pascal.js';
import 'codemirror/mode/perl/perl.js';
import 'codemirror/mode/php/php.js';
import 'codemirror/mode/powershell/powershell.js';
import 'codemirror/mode/pug/pug.js';
import 'codemirror/mode/python/python.js';
import 'codemirror/mode/r/r.js';
import 'codemirror/mode/ruby/ruby.js';
import 'codemirror/mode/sass/sass.js';
import 'codemirror/mode/shell/shell.js';
import 'codemirror/mode/smalltalk/smalltalk.js';
import 'codemirror/mode/soy/soy.js';
import 'codemirror/mode/spreadsheet/spreadsheet.js';
import 'codemirror/mode/sql/sql.js';
import 'codemirror/mode/stylus/stylus.js';
import 'codemirror/mode/swift/swift.js';
import 'codemirror/mode/toml/toml.js';
import 'codemirror/mode/tornado/tornado.js';
import 'codemirror/mode/vb/vb.js';
import 'codemirror/mode/vbscript/vbscript.js';
import 'codemirror/mode/xml/xml.js';
import 'codemirror/mode/yaml/yaml.js';
import { NoteSnippetEditor, NoteSnippetEditorBlurredEvent, NoteSnippetEditorFocusedEvent } from './note-snippet-editor';


export type CodeMirrorEditor = CodeMirror.Editor;
export type CodeMirrorEditorConfiguration = CodeMirror.EditorConfiguration;


/**
 * Add markdown list auto-indent addon.
 * Source form https://github.com/joel-porquet/CodeMirror-markdown-list-autoindent
 * IIFE.
 */
(function addCodeMirrorMarkdownListAutoindentAddon(): void {
    // noinspection RegExpRedundantEscape
    const listTokenRegExp = /^(\s*)(>[> ]*|[*+-] \[[x ]\]|[*+-]|(\d+)[.)])(\s*)$/;
    const matchListToken = (pos: any, cm: CodeMirrorEditor) => {
        /* Get some info about the current state */
        const eolState = cm.getStateAfter(pos.line);
        const inList = eolState.list !== false;
        const inQuote = eolState.quote !== 0;

        /* Get the line from the start to where the cursor currently is */
        const lineStart = (cm as any).getRange(CodeMirror.Pos(pos.line, 0), pos);

        /* Matches the beginning of the list line with the list token RE */
        const match = listTokenRegExp.exec(lineStart);

        /**
         * Not being in a list, or being in a list but not right after the list
         * token, are both not considered a match.
         */
        return !((!inList && !inQuote) || !match);
    };

    (CodeMirror as any).commands['autoIndentMarkdownList'] = (cm: CodeMirrorEditor) => {
        if (cm.getOption('disableInput')) {
            return CodeMirror.Pass;
        }

        const ranges: any[] = (cm as any).listSelections();

        for (let i = 0; i < ranges.length; i++) {
            const pos = ranges[i].head;

            if (!ranges[i].empty() || !matchListToken(pos, cm)) {
                /* If no match, call regular Tab handler */
                cm.execCommand('defaultTab');
                return;
            }

            /* Select the whole list line and indent it by one unit */
            cm.indentLine(pos.line, 'add');
        }
    };

    (CodeMirror as any).commands['autoUnindentMarkdownList'] = (cm: CodeMirrorEditor) => {
        if (cm.getOption('disableInput')) {
            return CodeMirror.Pass;
        }

        const ranges: any[] = (cm as any).listSelections();

        for (let i = 0; i < ranges.length; i++) {
            const pos = ranges[i].head;

            if (!ranges[i].empty() || !matchListToken(pos, cm)) {
                /* If no match, call regular Shift-Tab handler */
                cm.execCommand('indentAuto');
                return;
            }

            /* Select the whole list line and unindent it by one unit */
            cm.indentLine(pos.line, 'subtract');
        }
    };
})();


/**
 * Note snippet editor which editor implemented with 'CodeMirror'.
 * Its still abstract. If you want to use CodeMirror, use this abstract class to create an implementation.
 *
 * See the implementation:
 *  ./note-code-snippet-editor/note-code-snippet-editor.component.ts
 *  ./note-text-snippet-editor/note-text-snippet-editor.component.ts
 */
export abstract class NoteSnippetCodeMirrorEditor extends NoteSnippetEditor<CodeMirrorEditor> {
    _editor: CodeMirrorEditor;

    abstract editorHostEl: HTMLElement;

    private changeEventListener: () => void;
    private keyDownEventListener: (_: any, event: KeyboardEvent) => void;
    private focusEventListener: () => void;
    private blurEventListener: () => void;

    abstract getEditorOptions(): CodeMirrorEditorConfiguration;

    initialize(): void {
        this._editor = CodeMirror(this.editorHostEl, this.getEditorOptions());

        this.changeEventListener = () => {
            this.onValueChanged();
        };

        this.keyDownEventListener = (_, event: KeyboardEvent) => {
            this.onKeyDown(event);
        };

        this.focusEventListener = () => {
            this.handleFocus(true);
            this.emitEvent(new NoteSnippetEditorFocusedEvent(this._ref));
        };

        this.blurEventListener = () => {
            this.handleFocus(false);
            this.emitEvent(new NoteSnippetEditorBlurredEvent(this._ref));
        };

        this._editor.on('change', this.changeEventListener);
        this._editor.on('keydown', this.keyDownEventListener);
        this._editor.on('focus', this.focusEventListener);
        this._editor.on('blur', this.blurEventListener);

        this._afterInitialized.next();
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
