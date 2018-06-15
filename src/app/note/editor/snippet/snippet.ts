import {
    AfterViewInit,
    ElementRef,
    HostBinding,
    InjectionToken,
    Injector,
    OnDestroy,
    Type,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { KeyCodes } from '../../../../common/key-codes';
import {
    InsertNewSnippetAction,
    MoveFocusToNextSnippetAction,
    MoveFocusToPreviousSnippetAction,
    RemoveSnippetAction,
    UpdateSnippetContentAction,
} from '../../actions';
import { NoteContentSnippetTypes } from '../../models';
import { NoteStateWithRoot } from '../../reducers';
import { NoteEditorSnippetFactory } from './snippet-factory';


export interface NoteEditorSnippetOutlet {
    component: Type<any>;
    injector: Injector;
}


export const NOTE_EDITOR_SNIPPET_REF =
    new InjectionToken<NoteEditorSnippetRef>('NoteEditorSnippetRef');

export const NOTE_EDITOR_SNIPPET_CONFIG =
    new InjectionToken<NoteEditorSnippetConfig>('NoteEditorSnippetConfig');


export class NoteEditorSnippetConfig {
    type: NoteContentSnippetTypes;
    initialValue = '';
    language?: string;
    fileName?: string;
    isNewSnippet = false;
}


export class NoteEditorSnippetRef {
    outlet: NoteEditorSnippetOutlet;
    instance: NoteEditorSnippet;
    private _afterEditorInitialized = new Subject<void>();

    constructor(readonly id: string) {
    }

    afterEditorInitialized(): Observable<void> {
        return this._afterEditorInitialized.asObservable();
    }

    setOutlet(component: Type<NoteEditorSnippet>, injector: Injector): void {
        this.outlet = { component, injector };
    }

    setInstance(instance: NoteEditorSnippet): void {
        this.instance = instance;
        this.instance.afterEditorInitialized().subscribe(() => {
            this._afterEditorInitialized.next();
        });
    }
}


export abstract class NoteEditorSnippet implements OnDestroy, AfterViewInit {
    readonly _ref: NoteEditorSnippetRef;
    readonly _config: NoteEditorSnippetConfig;
    protected readonly store: Store<NoteStateWithRoot>;
    protected readonly _focusChanged = new Subject<boolean>();
    protected readonly _afterEditorInitialized = new Subject<void>();
    abstract contentEl: ElementRef;
    abstract _editor: any;

    @HostBinding('id')
    get id() {
        return this._ref.id;
    }

    protected constructor(injector: Injector) {
        this._ref = injector.get(NOTE_EDITOR_SNIPPET_REF);
        this._config = injector.get(NOTE_EDITOR_SNIPPET_CONFIG);
        this.store = injector.get(Store);

        this._ref.setInstance(this);
    }

    ngAfterViewInit(): void {
        this.init();
    }

    ngOnDestroy(): void {
        this.destroy();
        this._focusChanged.complete();
    }

    focusChanged(): Observable<boolean> {
        return this._focusChanged.asObservable();
    }

    afterEditorInitialized(): Observable<void> {
        return this._afterEditorInitialized.asObservable();
    }

    /** Editor initialize method **/
    abstract init(): void;

    /**
     * Editor destroy method.
     * Can be used to remove event listener on editor.
     */
    abstract destroy(): void;

    abstract focus(): void;

    abstract getValue(): string;

    abstract setValue(value: string): void;

    abstract hasFocusOnEditor(): boolean;

    abstract isCurrentPositionTop(): boolean;

    abstract isCurrentPositionBottom(): boolean;

    abstract setPositionToTop(): void;

    abstract setPositionToBottom(): void;

    isEmpty(): boolean {
        return this.getValue().trim() === '';
    }

    protected insertSwitchedSnippetAfter(): void {
        let switchedSnippetType: NoteContentSnippetTypes;

        switch (this._config.type) {
            case NoteContentSnippetTypes.TEXT:
                switchedSnippetType = NoteContentSnippetTypes.CODE;
                break;
            case NoteContentSnippetTypes.CODE:
                switchedSnippetType = NoteContentSnippetTypes.TEXT;
                break;
        }

        const action = new InsertNewSnippetAction({
            snippetId: this.id,
            content: NoteEditorSnippetFactory.createNewNoteContentSnippet(
                switchedSnippetType,
            ),
        });

        this.store.dispatch(action);
    }

    protected handleValueChanged(value: string): void {
        this.store.dispatch(new UpdateSnippetContentAction({
            snippetId: this.id,
            patch: { value },
        }));
    }

    protected handleFocus(focused: boolean): void {
        this._focusChanged.next(focused);
    }

    protected handleKeyDown(event: KeyboardEvent): void {
        switch (event.keyCode) {
            case KeyCodes.BACKSPACE:
                if (this.isEmpty()) {
                    this.store.dispatch(new RemoveSnippetAction({ snippetId: this.id }));
                }
                break;

            case KeyCodes.UP_ARROW:
                if (this.isCurrentPositionTop()) {
                    this.store.dispatch(
                        new MoveFocusToPreviousSnippetAction({ snippetId: this.id }));
                }
                break;

            case KeyCodes.DOWN_ARROW:
                if (this.isCurrentPositionBottom()) {
                    this.store.dispatch(
                        new MoveFocusToNextSnippetAction({ snippetId: this.id }));
                }
                break;

            case KeyCodes.ENTER:
                if (event.shiftKey) {
                    event.preventDefault();
                    this.insertSwitchedSnippetAfter();
                }
                break;
        }
    }
}
