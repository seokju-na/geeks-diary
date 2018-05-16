import { Injectable } from '@angular/core';
import { NoteContent, NoteContentSnippet } from '../models';
import { NoteEditorSnippetRef } from './snippet/snippet';
import { NoteEditorSnippetFactory } from './snippet/snippet-factory';


@Injectable()
export class NoteEditorService {
    snippetRefs: NoteEditorSnippetRef[] = [];

    constructor(private snippetFactory: NoteEditorSnippetFactory) {
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

    getSnippetRef(snippetId: string): NoteEditorSnippetRef | null {
        return this.snippetRefs.find(ref => ref.id === snippetId) || null;
    }

    getIndexOfSnippetRef(snippetId: string): number {
        return this.snippetRefs.findIndex(ref => ref.id === snippetId);
    }

    removeSnippet(snippetId: string): void {
        const index = this.getIndexOfSnippetRef(snippetId);

        if (index !== -1 && this.snippetRefs.length > 1) {
            this.snippetRefs.splice(index, 1);
            this.moveFocusByIndex(index, -1);
        }
    }

    moveFocus(snippetId: string, direction: 1 | -1): void {
        const index = this.snippetRefs.findIndex(snippet => snippet.id === snippetId);

        if (index !== -1) {
            this.moveFocusByIndex(index, direction);
        }
    }

    moveFocusByIndex(snippetIndex: number, direction: 1 | -1): void {
        const nextSnippet = this.snippetRefs[snippetIndex + direction];

        if (!nextSnippet) {
            return;
        }

        nextSnippet.instance.focus();

        if (direction > 0) {
            nextSnippet.instance.setPositionToTop();
        } else if (direction < 0) {
            nextSnippet.instance.setPositionToBottom();
        }
    }
}
