import { Injectable, Injector, Type } from '@angular/core';
import { NoteContentSnippet, NoteContentSnippetTypes } from '../../models';
import { NoteEditorCodeSnippetComponent } from './code-snippet.component';
import {
    NOTE_EDITOR_SNIPPET_CONFIG,
    NOTE_EDITOR_SNIPPET_REF,
    NoteEditorSnippet,
    NoteEditorSnippetConfig,
    NoteEditorSnippetRef,
} from './snippet';
import { NoteEditorTextSnippetComponent } from './text-snippet.component';


@Injectable()
export class NoteEditorSnippetFactory {
    static makeConfig(
        contentSnippet: NoteContentSnippet,
        isNewSnippet: boolean,
    ): NoteEditorSnippetConfig {

        switch (contentSnippet.type) {
            case NoteContentSnippetTypes.TEXT:
                return { initialValue: contentSnippet.value, isNewSnippet };

            case NoteContentSnippetTypes.CODE:
                return {
                    initialValue: contentSnippet.value,
                    language: isNewSnippet ? null : contentSnippet.language,
                    fileName: isNewSnippet ? null : contentSnippet.fileName,
                    isNewSnippet,
                };
        }
    }

    constructor(private injector: Injector) {
    }

    create(
        contentSnippet: NoteContentSnippet,
        isNewSnippet = false,
    ): NoteEditorSnippetRef {

        const config = NoteEditorSnippetFactory.makeConfig(contentSnippet, isNewSnippet);
        let component: Type<NoteEditorSnippet>;

        switch (contentSnippet.type) {
            case NoteContentSnippetTypes.TEXT:
                component = NoteEditorTextSnippetComponent;
                break;
            case NoteContentSnippetTypes.CODE:
                component = NoteEditorCodeSnippetComponent;
                break;
            default:
                throw new Error(`Invalid editor snippet type: ${contentSnippet.type}`);
        }

        const snippetRef = new NoteEditorSnippetRef(contentSnippet.id);
        const injector = this.createInjector(config, snippetRef);

        snippetRef.setOutlet(component, injector);

        return snippetRef;
    }

    private createInjector(
        contentSnippet: NoteEditorSnippetConfig,
        ref: NoteEditorSnippetRef,
    ): Injector {

        const providers = [
            { provide: NOTE_EDITOR_SNIPPET_CONFIG, useValue: contentSnippet },
            { provide: NOTE_EDITOR_SNIPPET_REF, useValue: ref },
        ];

        return Injector.create({ providers, parent: this.injector });
    }
}
