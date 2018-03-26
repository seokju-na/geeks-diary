import {
    AfterViewInit,
    ElementRef,
    HostBinding,
    HostListener,
    InjectionToken,
    Injector,
    OnDestroy,
    Type,
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { KeyCodes } from '../../../../common/key-codes';


let uniqueId = 0;

export enum NoteEditorSnippetEventNames {
    DID_INIT = 'DID_INIT',
    DID_FOCUS = 'DID_FOCUS',
    DID_BLUR = 'DID_BLUR',
    MOVE_FOCUS_TO_PREVIOUS = 'MOVE_FOCUS_TO_PREVIOUS',
    MOVE_FOCUS_TO_NEXT = 'MOVE_FOCUS_TO_NEXT',
    SWITCH_SNIPPET_ON_NEXT = 'SWITCH_SNIPPET_ON_NEXT',
    REMOVE_THIS = 'REMOVE_THIS',
    VALUE_CHANGED = 'VALUE_CHANGED',
}


export class NoteEditorSnippetEvent {
    constructor(public name: NoteEditorSnippetEventNames,
                public source: NoteEditorSnippetRef) {}
}


export interface NoteEditorSnippetOutlet {
    component: Type<NoteEditorSnippet>;
    injector: Injector;
}


export class NoteEditorSnippetRef {
    readonly id: string = `NoteEditorSnippet-${uniqueId++}`;
    readonly _events = new Subject<NoteEditorSnippetEvent>();

    outlet: NoteEditorSnippetOutlet;
    snippetInstance: NoteEditorSnippet;

    events(): Observable<NoteEditorSnippetEvent> {
        return this._events.asObservable();
    }

    setOutlet(comp: Type<NoteEditorSnippet>, injector: Injector): void {
        this.outlet = { component: comp, injector };
    }

    setSnippetInstance(instance: NoteEditorSnippet): void {
        this.snippetInstance = instance;
    }

    remove(): void {
        this._events.complete();
    }
}


export class NoteEditorSnippetConfig {
    initialValue = '';
    language?: string;
}


export const NOTE_EDITOR_SNIPPET_CONFIG =
    new InjectionToken<NoteEditorSnippetConfig>('NoteEditorSnippetConfig');


export const NOTE_EDITOR_SNIPPET_REF =
    new InjectionToken<NoteEditorSnippetRef>('NoteEditorSnippetRef');


export abstract class NoteEditorSnippet implements OnDestroy, AfterViewInit {
    readonly _ref: NoteEditorSnippetRef;
    readonly _config: NoteEditorSnippetConfig;
    abstract contentEl: ElementRef;
    abstract _editor: any;

    @HostBinding('id')
    get id() {
        return this._ref.id;
    }

    constructor(injector: Injector) {
        this._ref = injector.get(NOTE_EDITOR_SNIPPET_REF);
        this._config = injector.get(NOTE_EDITOR_SNIPPET_CONFIG);

        this._ref.setSnippetInstance(this);
    }

    ngAfterViewInit(): void {
        this.init();
    }

    ngOnDestroy(): void {
        this.destroy();
        this._ref.remove();
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

    protected handleFocus(focused: boolean): void {
        if (focused) {
            this.emitEvent(NoteEditorSnippetEventNames.DID_FOCUS);
        } else {
            this.emitEvent(NoteEditorSnippetEventNames.DID_BLUR);
        }
    }

    protected handleKeyDown(event: KeyboardEvent): void {
        switch (event.keyCode) {
            case KeyCodes.BACKSPACE:
                if (this.getValue().trim() === '') {
                    this.emitEvent(NoteEditorSnippetEventNames.REMOVE_THIS);
                }
                break;

            case KeyCodes.UP_ARROW:
                if (this.isCurrentPositionTop()) {
                    this.emitEvent(NoteEditorSnippetEventNames.MOVE_FOCUS_TO_PREVIOUS);
                }
                break;

            case KeyCodes.DOWN_ARROW:
                if (this.isCurrentPositionBottom()) {
                    this.emitEvent(NoteEditorSnippetEventNames.MOVE_FOCUS_TO_NEXT);
                }
                break;
        }
    }

    protected emitEvent(name: NoteEditorSnippetEventNames): void {
        this._ref._events.next(new NoteEditorSnippetEvent(name, this._ref));
    }

    @HostListener('click')
    private focusViaHostElementClick(): void {
        this.focus();
    }
}
