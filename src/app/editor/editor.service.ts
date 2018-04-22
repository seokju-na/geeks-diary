import { Injectable } from '@angular/core';
import { NoteContent, NoteContentSnippet } from '../note/models';
import { EditorSnippetRef } from './snippet/snippet';
import { EditorSnippetFactory } from './snippet/snippet-factory';


@Injectable()
export class EditorService {
    snippetRefs: EditorSnippetRef[] = [];

    constructor(private snippetFactory: EditorSnippetFactory) {
    }

    initFromNoteContent(content: NoteContent): void {
        this.snippetRefs = content.snippets.map(snippet =>
            this.snippetFactory.create(snippet, false));
    }

    insertNewSnippetRef(
        snippetId: string,
        newContentSnippet: NoteContentSnippet,
    ): void {

        const index = this.getIndexOfSnippetRef(snippetId);

        if (index === -1) {
            return;
        }

        this.snippetRefs.splice(
            index + 1,
            0,
            this.snippetFactory.create(newContentSnippet, true),
        );
    }

    getSnippetRef(snippetId: string): EditorSnippetRef | null {
        return this.snippetRefs.find(ref => ref.id === snippetId) || null;
    }

    getIndexOfSnippetRef(snippetId: string): number {
        return this.snippetRefs.findIndex(ref => ref.id === snippetId);
    }

    removeSnippet(snippetId: string): void {
        const index = this.getIndexOfSnippetRef(snippetId);

        if (index !== -1) {
            this.snippetRefs.splice(index, 1);
        }
    }
}
