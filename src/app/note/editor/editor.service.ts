import { Injectable } from '@angular/core';
import { NoteEditorSnippetFactory } from './snippets/snippet-factory';
import { NoteEditorSnippetRef } from './snippets/snippet';


@Injectable()
export class NoteEditorService {
    snippets: NoteEditorSnippetRef[] = [];

    constructor(private factory: NoteEditorSnippetFactory) {
        const ref = this.factory.create('text');

        this.snippets.push(ref);
    }
}
