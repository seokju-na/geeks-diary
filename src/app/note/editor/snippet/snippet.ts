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
import { KeyCodes } from '../../../../common/key-codes';
import {
    MoveFocusToNextSnippetAction,
    MoveFocusToPreviousSnippetAction,
    RemoveSnippetAction,
    UpdateSnippetContentAction,
} from '../../actions';
import { NoteStateWithRoot } from '../../reducers';


export interface NoteEditorSnippetOutlet {
    component: Type<any>;
    injector: Injector;
}


export const NOTE_EDITOR_SNIPPET_REF =
    new InjectionToken<NoteEditorSnippetRef>('NoteEditorSnippetRef');

export const NOTE_EDITOR_SNIPPET_CONFIG =
    new InjectionToken<NoteEditorSnippetConfig>('NoteEditorSnippetConfig');


export class NoteEditorSnippetConfig {
    initialValue = '';
    language?: string;
    fileName?: string;
    isNewSnippet = false;
}


export class NoteEditorSnippetRef {
    outlet: NoteEditorSnippetOutlet;
    instance: NoteEditorSnippet;

    constructor(readonly id: string) {
    }

    setOutlet(component: Type<NoteEditorSnippet>, injector: Injector): void {
        this.outlet = { component, injector };
    }

    setInstance(instance: NoteEditorSnippet): void {
        this.instance = instance;
    }
}


export abstract class NoteEditorSnippet implements OnDestroy, AfterViewInit {
    readonly _ref: NoteEditorSnippetRef;
    readonly _config: NoteEditorSnippetConfig;
    protected readonly store: Store<NoteStateWithRoot>;
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

    protected handleValueChanged(value: string): void {
        this.store.dispatch(new UpdateSnippetContentAction({
            snippetId: this.id,
            patch: { value },
        }));
    }

    protected handleFocus(focused: boolean): void {
        // let action: NoteActions;

        /*
         if (focused) {
         action = new DidSnippetFocusAction({ snippetId: this.id });
         } else {
         action = new DidSnippetBlurAction({ snippetId: this.id });
         }
         */

        // this.store.dispatch(action);
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
        }
    }
}
