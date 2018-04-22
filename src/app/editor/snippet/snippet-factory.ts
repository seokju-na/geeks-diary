import { Injectable, Injector, Type } from '@angular/core';
import { NoteContentSnippet, NoteContentSnippetTypes } from '../../note/models';
import { EditorCodeSnippetComponent } from './code-snippet.component';
import {
    EDITOR_SNIPPET_CONFIG,
    EDITOR_SNIPPET_REF,
    EditorSnippet,
    EditorSnippetConfig,
    EditorSnippetRef,
} from './snippet';


@Injectable()
export class EditorSnippetFactory {
    static makeConfig(
        contentSnippet: NoteContentSnippet,
        isNewSnippet: boolean,
    ): EditorSnippetConfig {

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
    ): EditorSnippetRef {

        const config = EditorSnippetFactory.makeConfig(contentSnippet, isNewSnippet);
        let component: Type<EditorSnippet>;

        switch (contentSnippet.type) {
            case NoteContentSnippetTypes.TEXT:
                break;
            case NoteContentSnippetTypes.CODE:
                component = EditorCodeSnippetComponent;
                break;
            default:
                throw new Error(`Invalid editor snippet type: ${contentSnippet.type}`);
        }

        const snippetRef = new EditorSnippetRef(contentSnippet.id);
        const injector = this.createInjector(config, snippetRef);

        snippetRef.setOutlet(component, injector);

        return snippetRef;
    }

    private createInjector(
        contentSnippet: EditorSnippetConfig,
        ref: EditorSnippetRef,
    ): Injector {

        const providers = [
            { provide: EDITOR_SNIPPET_CONFIG, useValue: contentSnippet },
            { provide: EDITOR_SNIPPET_REF, useValue: ref },
        ];

        return Injector.create({ providers, parent: this.injector });
    }
}
