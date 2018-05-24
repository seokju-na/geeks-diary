import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { NoteContent, NoteContentSnippet } from '../models';
import { NoteEditorSnippetRef } from './snippet/snippet';
import { NoteEditorSnippetFactory } from './snippet/snippet-factory';


export enum NoteEditorExtraEventNames {
    MOVE_FOCUS_OUT_OF_SNIPPETS = 'MOVE_FOCUS_OUT_OF_SNIPPETS',
}


export class NoteEditorExtraEvent {
    constructor(
        readonly name: NoteEditorExtraEventNames,
        readonly payload?: any,
    ) {
    }
}


@Injectable()
export class NoteEditorService implements OnDestroy {
    snippetRefs: NoteEditorSnippetRef[] = [];
    private _events = new Subject<NoteEditorExtraEvent>();

    constructor(private snippetFactory: NoteEditorSnippetFactory) {
    }

    ngOnDestroy(): void {
        this._events.complete();
    }

    events(): Observable<NoteEditorExtraEvent> {
        return this._events.asObservable();
    }

    initFromNoteContent(content: NoteContent): void {
        this.snippetRefs = content.snippets.map(snippet =>
            this.snippetFactory.createWithContent(snippet, false));
    }

    insertNewSnippetRef(
        snippetId: string,
        content: NoteContentSnippet,
    ): void {

        const index = this.getIndexOfSnippetRef(snippetId);

        if (index === -1) {
            return;
        }

        const snippetRef = this.snippetFactory.createWithContent(content, true);

        this.snippetRefs.splice(
            index + 1,
            0,
            snippetRef,
        );

        setTimeout(() => {
            if (snippetRef.instance) {
                snippetRef.instance.focus();
            }
        });
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

    setFocusByIndex(snippetIndex: number): void {
        const snippet = this.snippetRefs[snippetIndex];

        if (snippet) {
            snippet.instance.focus();
        }
    }

    moveFocus(snippetId: string, direction: 1 | -1): void {
        const index = this.snippetRefs.findIndex(snippet => snippet.id === snippetId);

        if (index !== -1) {
            this.moveFocusByIndex(index, direction);
        }
    }

    moveFocusByIndex(snippetIndex: number, direction: 1 | -1): void {
        const nextIndex = snippetIndex + direction;

        if (nextIndex < 0) {
            this.handleFocusOut(-1);
            return;
        } else if (nextIndex >= this.snippetRefs.length) {
            this.handleFocusOut(1);
            return;
        }

        const nextSnippet = this.snippetRefs[snippetIndex + direction];

        nextSnippet.instance.focus();

        if (direction > 0) {
            nextSnippet.instance.setPositionToTop();
        } else if (direction < 0) {
            nextSnippet.instance.setPositionToBottom();
        }
    }

    private handleFocusOut(direction: 1 | -1): void {
        this._events.next(new NoteEditorExtraEvent(
            NoteEditorExtraEventNames.MOVE_FOCUS_OUT_OF_SNIPPETS,
            { direction },
        ));
    }
}
