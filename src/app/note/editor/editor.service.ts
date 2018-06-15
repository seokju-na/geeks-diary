import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { NoteContent, NoteContentSnippet, NoteContentSnippetTypes } from '../models';
import { NoteEditorCodeSnippetComponent } from './snippet/code-snippet.component';
import { NoteEditorSnippetRef } from './snippet/snippet';
import { NoteEditorSnippetFactory } from './snippet/snippet-factory';


export enum NoteEditorExtraEventNames {
    MOVE_FOCUS_OUT_OF_SNIPPETS = 'MOVE_FOCUS_OUT_OF_SNIPPETS',
    SNIPPET_FOCUSED = 'SNIPPET_FOCUSED',
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
    private focusEventSubscriptionMap = new Map<NoteEditorSnippetRef, Subscription>();

    constructor(private snippetFactory: NoteEditorSnippetFactory) {
    }

    ngOnDestroy(): void {
        this._events.complete();
        this.focusEventSubscriptionMap.clear();
    }

    events(): Observable<NoteEditorExtraEvent> {
        return this._events.asObservable();
    }

    initFromNoteContent(content: NoteContent): void {
        this.snippetRefs = content.snippets.map((snippet) => {
            const snippetRef = this.snippetFactory.createWithContent(snippet, false);

            this.subscribeSnippetFocusEvent(snippetRef);

            return snippetRef;
        });
    }

    dispose(): void {
        this.snippetRefs.forEach((snippetRef) => {
            this.unsubscribeSnippetFocusEvent(snippetRef);
        });

        this.snippetRefs = [];
        this.focusEventSubscriptionMap.clear();
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

        snippetRef.afterEditorInitialized().subscribe(() => {
            snippetRef.instance.focus();
        });

        this.subscribeSnippetFocusEvent(snippetRef);
        this.snippetRefs.splice(index + 1, 0, snippetRef);
    }

    getIndexOfSnippetRef(snippetId: string): number {
        return this.snippetRefs.findIndex(ref => ref.id === snippetId);
    }

    removeSnippet(snippetId: string): void {
        const index = this.getIndexOfSnippetRef(snippetId);

        if (index !== -1 && this.snippetRefs.length > 1) {
            this.unsubscribeSnippetFocusEvent(this.snippetRefs[index]);
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

    updateLayout(): void {
        this.snippetRefs.forEach((snippetRef) => {
            if (snippetRef.instance._config.type === NoteContentSnippetTypes.CODE) {
                const instance = snippetRef.instance as NoteEditorCodeSnippetComponent;
                instance.layoutHeight();
            }
        });
    }

    private subscribeSnippetFocusEvent(ref: NoteEditorSnippetRef): void {
        ref.afterEditorInitialized().subscribe(() => {
            const subscription = ref.instance.focusChanged().subscribe((focused) => {
                this.handleSnippetFocus(ref, focused);
            });

            this.focusEventSubscriptionMap.set(ref, subscription);
        });
    }

    private unsubscribeSnippetFocusEvent(ref: NoteEditorSnippetRef): void {
        const subscription = this.focusEventSubscriptionMap.get(ref);

        if (subscription) {
            subscription.unsubscribe();
        }

        this.focusEventSubscriptionMap.delete(ref);
    }

    private handleFocusOut(direction: 1 | -1): void {
        this._events.next(new NoteEditorExtraEvent(
            NoteEditorExtraEventNames.MOVE_FOCUS_OUT_OF_SNIPPETS,
            { direction },
        ));
    }

    private handleSnippetFocus(ref: NoteEditorSnippetRef, focused: boolean): void {
        this._events.next(new NoteEditorExtraEvent(
            NoteEditorExtraEventNames.SNIPPET_FOCUSED,
            { snippetRef: ref, focused },
        ));
    }
}
