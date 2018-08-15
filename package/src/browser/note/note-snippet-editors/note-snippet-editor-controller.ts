import {
    ApplicationRef,
    ComponentFactoryResolver,
    Injectable,
    Injector,
    ViewContainerRef,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { NoteContent, NoteSnippetContent } from '../shared/note-content.model';
import { NoteSnippetEditorEvents } from './note-snippet-editor-events';
import { NoteSnippetEditorFactory } from './note-snippet-editor-factory';
import { NoteSnippetEditorRef } from './note-snippet-editor-ref';


/**
 * Controls multiple note snippet editors.
 * This class communicates directly with the note snippet editor component and handles events.
 */
@Injectable()
export class NoteSnippetEditorController {
    private containerElement: HTMLElement | null = null;
    private hostViewContainerRef: ViewContainerRef | null = null;

    private snippets: NoteSnippetEditorRef<any>[] = [];

    constructor(
        private factory: NoteSnippetEditorFactory,
        /** Dependency for dom portal outlet. */
        private componentFactoryResolver: ComponentFactoryResolver,
        /** Dependency for dom portal outlet. */
        private appRef: ApplicationRef,
        private injector: Injector,
    ) {
    }

    private _events = new Subject<NoteSnippetEditorEvents>();

    /** All note snippet editor event stream. */
    get events(): Observable<NoteSnippetEditorEvents> {
        return this._events.asObservable();
    }

    /**
     * Set container where snippet editor should be created.
     *
     * Host view container reference is optional. If it provided, the controller adds the component
     * as a child of the host container. (Not for rendering, on the component tree of Angular)
     *
     * ** Make sure to call this method after view initialized. **
     *
     * @param {HTMLElement} containerElement
     * @param {ViewContainerRef} hostViewContainerRef
     */
    setContainer(
        containerElement: HTMLElement,
        hostViewContainerRef?: ViewContainerRef,
    ): void {
        this.containerElement = containerElement;

        if (this.hostViewContainerRef) {
            this.hostViewContainerRef = hostViewContainerRef;
        }
    }

    /**
     * Initialize all note snippet editors from note content.
     * @param {NoteContent} noteContent
     */
    initFromNoteContent(noteContent: NoteContent): void {
        // Remove all snippets.
        this.snippets = [];

        noteContent.snippets.forEach((snippetContent) => {
            this.append(snippetContent);
        });
    }

    /**
     * Append note snippet editor.
     * @param {NoteSnippetContent} content
     */
    append(content: NoteSnippetContent): void {
    }

    /**
     * Insert note snippet editor at position of index.
     * @param {number} index
     * @param {NoteSnippetContent} content
     */
    insert(index: number, content: NoteSnippetContent): void {
    }

    /**
     * Remove note snippet editor at position of index.
     * @param {number} index
     */
    remove(index: number): void {
    }

    /**
     * Focus note snippet editor at position of index.
     * @param {number} index
     */
    focus(index: number): void {
    }

    /**
     * Move focus by direction form index.
     * If direction is '1' focus next of index, if its '-1' focus previous of index.
     *
     * @param index
     * @param direction
     */
    moveFocus(index: number, direction: 1 | -1): void {
    }

    findById(id: string): NoteSnippetEditorRef<any> | undefined {
        return this.snippets.find(snippet => snippet.id === id);
    }

    findIndexById(id: string): number {
        return this.snippets.findIndex(snippet => snippet.id === id);
    }

    private attachSnippetRef(snippetRef: NoteSnippetEditorRef): void {
    }

    private dettachSnippetRef(): void {
    }
}
