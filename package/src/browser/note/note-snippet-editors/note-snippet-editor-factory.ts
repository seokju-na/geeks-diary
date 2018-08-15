import { ComponentType, PortalInjector } from '@angular/cdk/portal';
import { Injectable, Injector } from '@angular/core';
import { NoteSnippetContent } from '../shared/note-content.model';
import { NoteSnippetEditor } from './note-snippet-editor';
import { NoteSnippetEditorConfig } from './note-snippet-editor-config';
import { NoteSnippetEditorRef } from './note-snippet-editor-ref';


/**
 * This class is responsible for producing the note snippet editor.
 * Result of product is to be reference of note snippet editor.
 */
@Injectable()
export class NoteSnippetEditorFactory {
    constructor(
        private injector: Injector,
    ) {
    }

    create<T extends NoteSnippetEditor>(
        component: ComponentType<T>,
        conifg: NoteSnippetEditorConfig,
    ): NoteSnippetEditorRef<T> {
    }

    createFromNoteSnippetContent<T extends NoteSnippetEditor>(
        content: NoteSnippetContent,
    ): NoteSnippetEditorRef<T> {
    }

    /**
     * Create injector for note snippet editor.
     */
    private createInjector<T extends NoteSnippetEditor>(
        snippetEditorRef: NoteSnippetEditorRef<T>,
    ): PortalInjector {

        const injectionTokens = new WeakMap<any, any>([
            [NoteSnippetEditorRef, snippetEditorRef],
        ]);

        return new PortalInjector(this.injector, injectionTokens);
    }
}
