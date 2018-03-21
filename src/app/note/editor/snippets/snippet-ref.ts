import { Injector, Type } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { NoteEditorSnippet } from './snippet';


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
