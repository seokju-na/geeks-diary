import { Injectable, Injector, Type } from '@angular/core';
import * as createUniqueId from 'uuid/v4';
import { NoteContentSnippet, NoteContentSnippetTypes } from '../../models';
import {
    NOTE_EDITOR_SNIPPET_CONFIG,
    NOTE_EDITOR_SNIPPET_REF,
    NoteEditorSnippet,
    NoteEditorSnippetConfig,
    NoteEditorSnippetRef,
} from './snippet';
import { NoteEditorCodeSnippetComponent } from './code-snippet.component';
import { NoteEditorTextSnippetComponent } from './text-snippet.component';


function throwInvalidNoteContentSnippetTypeError(type: any): void {
    throw new Error(`Invalid note content snippet type: ${type}`);
}


@Injectable()
export class NoteEditorSnippetFactory {
    static isValidType(type: NoteContentSnippetTypes): boolean {
        return type === NoteContentSnippetTypes.TEXT
            || type === NoteContentSnippetTypes.CODE;
    }

    static makeConfig(
        contentSnippet: NoteContentSnippet,
        isNewSnippet: boolean,
    ): NoteEditorSnippetConfig {

        const type = contentSnippet.type;

        if (!NoteEditorSnippetFactory.isValidType(type)) {
            throwInvalidNoteContentSnippetTypeError(type);
        }

        switch (type) {
            case NoteContentSnippetTypes.TEXT:
                return {
                    type: NoteContentSnippetTypes.TEXT,
                    initialValue: contentSnippet.value,
                    isNewSnippet,
                };

            case NoteContentSnippetTypes.CODE:
                return {
                    type: NoteContentSnippetTypes.CODE,
                    initialValue: contentSnippet.value,
                    language: isNewSnippet ? '' : contentSnippet.language,
                    fileName: isNewSnippet ? 'No File Name' : contentSnippet.fileName,
                    isNewSnippet,
                };
        }
    }

    static createNewNoteContentSnippet(
        type: NoteContentSnippetTypes,
    ): NoteContentSnippet {

        if (!NoteEditorSnippetFactory.isValidType(type)) {
            throwInvalidNoteContentSnippetTypeError(type);
        }

        const id = createUniqueId();

        switch (type) {
            case NoteContentSnippetTypes.TEXT:
                return {
                    id,
                    type,
                    value: '',
                };

            case NoteContentSnippetTypes.CODE:
                return {
                    id,
                    type,
                    value: '',
                    language: '',
                    fileName: 'No File Name',
                };
        }
    }

    constructor(private injector: Injector) {
    }

    createWithContent(
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
