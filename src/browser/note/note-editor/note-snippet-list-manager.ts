import { ComponentPortal, ComponentType, DomPortalOutlet, PortalInjector } from '@angular/cdk/portal';
import { ApplicationRef, ComponentFactoryResolver, Injectable, Injector, ViewContainerRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { merge, Observable, Subject, Subscription } from 'rxjs';
import { NoteSnippetTypes } from '../../../core/note';
import { NoteStateWithRoot } from '../note.state';
import { NoteCodeSnippetEditorComponent } from './note-code-snippet-editor/note-code-snippet-editor.component';
import { NoteContent, NoteSnippetContent } from './note-content.model';
import {
    AppendSnippetAction,
    BlurSnippetAction,
    FocusSnippetAction,
    InsertSnippetAction,
    RemoveSnippetAction,
    UpdateSnippetAction,
} from './note-editor.actions';
import {
    NoteSnippetEditor,
    NoteSnippetEditorConfig,
    NoteSnippetEditorEvent,
    NoteSnippetEditorEventNames,
    NoteSnippetEditorRef,
} from './note-snippet-editor';
import { NoteTextSnippetEditorComponent } from './note-text-snippet-editor/note-text-snippet-editor.component';


let uniqueId = 0;


@Injectable()
export class NoteSnippetListManager {
    /** Snippet references communicate with snippets. */
    private snippetRefs: NoteSnippetEditorRef<any>[] = [];

    private containerEl: HTMLElement;
    private viewContainerRef: ViewContainerRef;

    /** Subscription for snippet reference's events. */
    private snippetRefEventsSubscription = Subscription.EMPTY;

    private _topFocusOut = new Subject<void>();

    constructor(
        private injector: Injector,
        private componentFactoryResolver: ComponentFactoryResolver,
        private appRef: ApplicationRef,
        private store: Store<NoteStateWithRoot>,
    ) {
    }

    getSnippetRefByIndex(index: number): NoteSnippetEditorRef<any> | null {
        return this.snippetRefs[index] || null;
    }

    topFocusOut(): Observable<void> {
        return this._topFocusOut.asObservable();
    }

    setContainerElement(containerEl: HTMLElement): this {
        this.containerEl = containerEl;
        return this;
    }

    setViewContainerRef(viewContainerRef: ViewContainerRef): this {
        this.viewContainerRef = viewContainerRef;
        return this;
    }

    addAllSnippetsFromContent(content: NoteContent): NoteSnippetEditorRef<any>[] {
        content.snippets.forEach((snippet) => {
            const ref = this.attachSnippetEditorComponent(
                this.appendPaneElement(),
                snippet,
            );

            this.snippetRefs.push(ref);
        });

        this.updateSnippetRefEventsSubscription();
        setTimeout(() => this.resizeSnippets());

        return this.snippetRefs;
    }

    appendSnippet(snippet: NoteSnippetContent): NoteSnippetEditorRef<any> {
        const ref = this.attachSnippetEditorComponent(
            this.appendPaneElement(),
            snippet,
        );

        // Focus after new snippet initialized.
        ref.afterInitialized().subscribe(() => ref.componentInstance.focus());

        this.snippetRefs.push(ref);
        this.updateSnippetRefEventsSubscription();

        return ref;
    }

    insertSnippetAt(index: number, snippet: NoteSnippetContent): NoteSnippetEditorRef<any> | null {
        if (!this.hasSnippetRefAt(index)) {
            return null;
        }

        const newRef = this.attachSnippetEditorComponent(
            this.insertPaneElementAt(index),
            snippet,
        );

        // Focus after new snippet initialized.
        newRef.afterInitialized().subscribe(() => newRef.componentInstance.focus());

        this.snippetRefs.splice(index, 0, newRef);
        this.updateSnippetRefEventsSubscription();

        return newRef;
    }

    removeSnippetAt(index: number): void {
        if (this.hasSnippetRefAt(index)) {
            this.destroySnippetAt(index);
            this.snippetRefs.splice(index, 1);
            this.updateSnippetRefEventsSubscription();

            // Move focus to previous snippet.
            this.moveFocusByIndex(index, -1);
        }
    }

    removeAllSnippets(): void {
        for (let i = 0; i < this.snippetRefs.length; i++) {
            this.destroySnippetAt(i);
        }

        this.snippetRefs = [];

        if (this.snippetRefEventsSubscription) {
            this.snippetRefEventsSubscription.unsubscribe();
        }
    }

    focusTo(index: number): void {
        if (this.hasSnippetRefAt(index)) {
            this.snippetRefs[index].componentInstance.focus();
        }
    }

    moveFocusByIndex(index: number, direction: 1 | -1): void {
        const nextSnippet = this.snippetRefs[index + direction];

        if (nextSnippet) {
            nextSnippet.componentInstance.focus();

            if (direction === 1) {
                nextSnippet.componentInstance.setPositionToTop();
            } else if (direction === -1) {
                nextSnippet.componentInstance.setPositionToBottom();
            }
        }
    }

    resizeSnippets(): void {
        this.snippetRefs.forEach((snippetRef) => {
            const instance = snippetRef.componentInstance as NoteSnippetEditor<any>;

            if (instance && instance.resize) {
                instance.resize();
            }
        });
    }

    handleSnippetRefEvent(event: NoteSnippetEditorEvent): void {
        const index = this.snippetRefs.findIndex(ref => ref.id === event.source.id);

        switch (event.name) {
            case NoteSnippetEditorEventNames.REMOVE_THIS:
                // If it's has only one snippet, it cannot be removed.
                if (index === 0 && this.snippetRefs.length === 1) {
                    return;
                }

                this.removeSnippetAt(index);
                this.store.dispatch(new RemoveSnippetAction({ index }));
                break;

            case NoteSnippetEditorEventNames.NEW_SNIPPET:
                if (index === this.snippetRefs.length - 1) {
                    this.appendSnippet(event.payload.snippet);
                    this.store.dispatch(new AppendSnippetAction({ snippet: event.payload.snippet }));
                } else {
                    this.insertSnippetAt(index + 1, event.payload.snippet);
                    this.store.dispatch(new InsertSnippetAction({ index: index + 1, snippet: event.payload.snippet }));
                }
                break;

            case NoteSnippetEditorEventNames.MOVE_FOCUS_TO_PREVIOUS:
                // Move focus to outside.
                if (index === 0) {
                    this._topFocusOut.next();
                } else {
                    this.moveFocusByIndex(index, -1);
                }
                break;

            case NoteSnippetEditorEventNames.MOVE_FOCUS_TO_NEXT:
                this.moveFocusByIndex(index, 1);
                break;

            case NoteSnippetEditorEventNames.VALUE_CHANGED:
                this.store.dispatch(new UpdateSnippetAction({
                    index,
                    patch: { value: event.payload.value },
                }));
                break;

            case NoteSnippetEditorEventNames.FOCUSED:
                this.store.dispatch(new FocusSnippetAction({ index }));
                break;

            case NoteSnippetEditorEventNames.BLURRED:
                this.store.dispatch(new BlurSnippetAction());
                break;

            case NoteSnippetEditorEventNames.INSERT_IMAGE:
                if (event.source._config.type === NoteSnippetTypes.TEXT) {
                    event.source.componentInstance.insertValueAtCursor(
                        `![${event.payload.fileName}](${event.payload.filePath})`,
                    );
                }
                break;
        }
    }

    private hasSnippetRefAt(index: number): boolean {
        return this.snippetRefs[index] !== undefined;
    }

    private makeConfigFromSnippet(snippet: NoteSnippetContent): NoteSnippetEditorConfig {
        let config: NoteSnippetEditorConfig = {
            type: snippet.type,
            value: snippet.value,
        };

        if (snippet.type === NoteSnippetTypes.CODE) {
            config = { ...config, codeLanguage: snippet.codeLanguageId, codeFileName: snippet.codeFileName };
        }

        return {
            ...new NoteSnippetEditorConfig(),
            ...config,
        };
    }

    private attachSnippetEditorComponent(
        pane: HTMLElement,
        snippet: NoteSnippetContent,
    ): NoteSnippetEditorRef<any> {
        const config = this.makeConfigFromSnippet(snippet);
        const ref = new NoteSnippetEditorRef(config);
        const portal = new DomPortalOutlet(pane, this.componentFactoryResolver, this.appRef, this.injector);

        let component: ComponentType<NoteSnippetEditor>;

        switch (snippet.type) {
            case NoteSnippetTypes.TEXT:
                component = NoteTextSnippetEditorComponent;
                break;
            case NoteSnippetTypes.CODE:
                component = NoteCodeSnippetEditorComponent;
                break;
            default:
                throw new Error(`Cannot find snippet type: ${snippet.type}`);
        }

        const injector = this.createInjector(config, ref);
        const snippetEditorRef = portal.attachComponentPortal(
            new ComponentPortal<NoteSnippetEditor>(component, this.viewContainerRef || undefined, injector),
        );

        ref.panePortal = portal;
        ref.paneElementId = pane.id;
        ref.componentInstance = snippetEditorRef.instance;

        return ref;
    }

    private appendPaneElement(): HTMLElement {
        const pane = document.createElement('div');

        pane.id = `gd-note-snippet-editor-pane-${uniqueId++}`;
        pane.classList.add('NoteSnippetEditorPane');

        this.containerEl.appendChild(pane);

        return pane;
    }

    private insertPaneElementAt(index: number): HTMLElement {
        const pane = document.createElement('div');

        pane.id = `gd-note-snippet-editor-pane-${uniqueId++}`;
        pane.classList.add('NoteSnippetEditorPane');

        const reference = this.containerEl.querySelector(`.NoteSnippetEditorPane:nth-child(${index + 1})`);
        this.containerEl.insertBefore(pane, reference);

        return pane;
    }

    private createInjector<T extends NoteSnippetEditor<any>>(
        config: NoteSnippetEditorConfig,
        ref: NoteSnippetEditorRef<T>,
    ): PortalInjector {
        const injectionTokens = new WeakMap<any, any>([
            [NoteSnippetEditorRef, ref],
            [NoteSnippetEditorConfig, config],
        ]);

        return new PortalInjector(this.injector, injectionTokens);
    }

    /**
     * Destroy snippet reference at index.
     * @param index
     */
    private destroySnippetAt(index: number): void {
        const snippetRef = this.snippetRefs[index];

        if (!snippetRef) {
            return;
        }

        snippetRef.destroy();
        snippetRef.panePortal.dispose();

        const paneElementId = snippetRef.paneElementId;
        const paneEl = this.containerEl.querySelector(`#${paneElementId}`);

        // Remove pane element if it exists.
        if (paneEl) {
            this.containerEl.removeChild(paneEl);
        }
    }

    /**
     * Update snippet references events stream subscription.
     */
    private updateSnippetRefEventsSubscription(): void {
        if (this.snippetRefEventsSubscription) {
            this.snippetRefEventsSubscription.unsubscribe();
        }

        this.snippetRefEventsSubscription = merge(
            ...this.snippetRefs.map(snippetRef => snippetRef.events.asObservable()),
        ).subscribe(event => this.handleSnippetRefEvent(event));
    }
}
