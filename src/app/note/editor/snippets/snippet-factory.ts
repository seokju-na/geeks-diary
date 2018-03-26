import { Injectable, Injector, Type } from '@angular/core';
import {
    NOTE_EDITOR_SNIPPET_CONFIG,
    NOTE_EDITOR_SNIPPET_REF,
    NoteEditorSnippet,
    NoteEditorSnippetConfig,
    NoteEditorSnippetRef,
} from './snippet';
import { NoteCodeEditorSnippetComponent } from './code-snippet.component';
import { NoteTextEditorSnippetComponent } from './text-snippet.component';


function applyConfigDefaults(config?: NoteEditorSnippetConfig,
                             defaultConfig?: NoteEditorSnippetConfig): NoteEditorSnippetConfig {

    return { ...defaultConfig, ...config };
}


@Injectable()
export class NoteEditorSnippetFactory {
    constructor(private injector: Injector) {
    }

    create(type: 'text' | 'code', config?: NoteEditorSnippetConfig): NoteEditorSnippetRef {
        config = applyConfigDefaults(config, new NoteEditorSnippetConfig());

        let comp: Type<NoteEditorSnippet>;

        switch (type) {
            case 'text':
                comp = NoteTextEditorSnippetComponent;
                break;
            case 'code':
                comp = NoteCodeEditorSnippetComponent;
                break;
            default:
                throw new Error(`Invalid note editor snippet type: ${type}`);
        }

        const snippetRef = new NoteEditorSnippetRef();
        const injector = this.createInjector(config, snippetRef);

        snippetRef.setOutlet(comp, injector);

        return snippetRef;
    }

    private createInjector(config: NoteEditorSnippetConfig,
                           snippetRef: NoteEditorSnippetRef): Injector {

        const providers = [
            { provide: NOTE_EDITOR_SNIPPET_CONFIG, useValue: config },
            { provide: NOTE_EDITOR_SNIPPET_REF, useValue: snippetRef },
        ];

        return Injector.create({
            providers,
            parent: this.injector,
        });
    }
}
