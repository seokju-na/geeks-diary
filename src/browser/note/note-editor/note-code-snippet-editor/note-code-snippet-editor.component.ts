import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { CodeMirrorSupportedLanguageTypes, Stack, StackViewer } from '../../../stack';
import { CodeMirrorEditorConfiguration, NoteSnippetCodeMirrorEditor } from '../note-snippet-code-mirror-editor';
import { NoteSnippetEditorConfig, NoteSnippetEditorRef } from '../note-snippet-editor';



const _ = CodeMirrorSupportedLanguageTypes;
const codeMirrorLanguageModeMap: { [key: string]: any } = {
    [_.TYPESCRIPT]: 'text/typescript',
    [_.JAVASCRIPT]: 'text/javascript',
    [_.DART]: 'application/dart',
    [_.PYTHON]: 'text/x-python',
    [_.GO]: 'text/x-go',
    [_.JAVA]: 'text/x-java',
    [_.KOTLIN]: 'text/x-kotlin',
    [_.C]: 'text/x-csrc',
    [_.CPP]: 'text/x-c++src',
    [_.CSHARP]: 'text/x-csharp',
    [_.OBJECTIVE_C]: 'text/x-objectivec',
    [_.SCALA]: 'text/x-scala',
    [_.SQUIRREL]: 'text/x-squirrel',
    [_.CEYLON]: 'text/x-ceylon',
    [_.OCAML]: 'text/x-ocaml',
    [_.FSHARP]: 'text/x-fsharp',
    [_.OCTAVE]: 'text/x-octave',
    [_.PASCAL]: 'text/x-pascal',
    [_.CLOJURE]: 'text/x-clojure',
    [_.PHP]: 'text/x-php',
    [_.JINJA2]: { name: 'jinja2', htmlMode: true },
    [_.CMAKE]: 'text/x-cmake',
    [_.APL]: 'text/apl',
    [_.ASN1]: 'text/x-ttcn-asn',
    [_.OZ]: 'text/x-oz',
    [_.PERL]: 'text/x-perl',
    [_.POWERSHELL]: 'application/x-powershell',
    [_.PUG]: 'text/x-pug',
    [_.JADE]: 'text/x-jade',
    [_.D]: 'text/x-d',
    [_.R]: 'text/x-rsrc',
    [_.DOCKERFILE]: 'text/x-dockerfile',
    [_.RUBY]: 'text/x-ruby',
    [_.RUST]: 'text/x-rustsrc',
    [_.SASS]: 'text/x-sass',
    [_.SPREADSHEET]: 'text/x-spreadsheet',
    [_.DYLAN]: 'text/x-dylan',
    [_.ECL]: 'text/x-ecl',
    [_.ELM]: 'text/x-elm',
    [_.SHELL]: 'text/x-sh',
    [_.SMALLTALK]: 'text/x-stsrc',
    [_.FORTRAN]: 'text/x-fortran',
    [_.STYLUS]: 'text/x-styl',
    [_.SOY]: 'text/x-soy',
    [_.MYSQL]: 'text/x-mysql',
    [_.POSTGRESQL]: 'text/x-pgsql',
    [_.GROOVY]: 'text/x-groovy',
    [_.HAML]: 'text/x-haml',
    [_.SWIFT]: 'text/x-swift',
    [_.HANDLEBARS]: {
        name: 'handlebars',
        base: 'text/html',
    },
    [_.HASKELL]: 'text/x-haskell',
    [_.ASPX]: 'application/x-aspx',
    [_.EJS]: 'application/x-ejs',
    [_.JSP]: 'application/x-jsp',
    [_.HTTP]: 'message/http',
    [_.TOML]: 'text/x-toml',
    [_.TORNADO]: 'text/x-tornado',
    [_.LESS]: 'text/x-less',
    [_.VB_NET]: 'text/x-vb',
    [_.YAML]: 'text/x-yaml',
    [_.NGINX]: 'text/x-nginx-conf',
    [_.VUE]: 'text/x-vue',
    [_.VBSCRIPT]: 'text/vbscript',
    [_.XML]: 'application/xml',
};


@Component({
    selector: 'gd-note-code-snippet-editor',
    templateUrl: './note-code-snippet-editor.component.html',
    styleUrls: ['./note-code-snippet-editor.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        'class': 'NoteCodeSnippetEditor',
    },
})
export class NoteCodeSnippetEditorComponent extends NoteSnippetCodeMirrorEditor implements OnInit {
    editorHostEl: HTMLElement;
    stack: Stack | null = null;

    private focused: boolean = false;

    constructor(
        ref: NoteSnippetEditorRef<NoteCodeSnippetEditorComponent>,
        config: NoteSnippetEditorConfig,
        private elementRef: ElementRef<HTMLElement>,
        private stackViewer: StackViewer,
        private changeDetectorRef: ChangeDetectorRef,
    ) {
        super(ref, config);
    }

    ngOnInit(): void {
        this.editorHostEl = this.elementRef.nativeElement.querySelector('.NoteCodeSnippetEditor__editor');
        this.updateStack();

        super.ngOnInit();
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

    getEditorOptions(): CodeMirrorEditorConfiguration {
        return {
            value: this._config.value,
            mode: codeMirrorLanguageModeMap[this._config.codeLanguage] || this._config.codeLanguage,
            indentUnit: 4,
            lineWrapping: false,
            lineNumbers: true,
            scrollbarStyle: 'null',
            autofocus: false,
            viewportMargin: Infinity,
        };
    }

    handleFocus(focused: boolean): void {
        this.focused = focused;

        const hostEl = this.elementRef.nativeElement;
        const focusedClassName = 'NoteCodeSnippetEditor--focused';

        if (this.focused && !hostEl.classList.contains(focusedClassName)) {
            hostEl.classList.add(focusedClassName);
        } else if (!this.focused && hostEl.classList.contains(focusedClassName)) {
            hostEl.classList.remove(focusedClassName);
        }
    }

    private updateStack(): void {
        this.stack = this.stackViewer.getStack(this._config.codeLanguage);
        this.changeDetectorRef.markForCheck();
    }
}
