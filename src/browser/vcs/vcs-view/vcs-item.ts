import { FocusableOption } from '@angular/cdk/a11y';
import { DomPortalOutlet } from '@angular/cdk/portal';
import { ElementRef } from '@angular/core';
import { Type } from '@angular/core/src/type';
import { Subject } from 'rxjs';
import { VcsFileChange } from '../../../core/vcs';


export class VcsItemConfig {
    fileChanges: VcsFileChange[];
    checked?: boolean = false;
}


/**
 * Events for vcs item.
 */
export enum VcsItemEventNames {
    UPDATE_CHECKED = 'vcsItemUpdateChecked',
}


interface VcsItemEventInterface {
    readonly name: VcsItemEventNames;
    readonly source: VcsItemRef<any>;
    readonly payload?: any;
}


export type VcsItemEvent =
    VcsItemUpdateCheckedEvent;


export class VcsItemUpdateCheckedEvent implements VcsItemEventInterface {
    readonly name = VcsItemEventNames.UPDATE_CHECKED;

    constructor(
        public readonly source: VcsItemRef<any>,
        public readonly payload: { checked: boolean },
    ) {
    }
}


/** Abstraction for implement vcs item component. */
export abstract class VcsItem implements FocusableOption {
    protected constructor(
        public _elementRef: ElementRef<HTMLElement>,
        public _ref: VcsItemRef<any>,
        public _config: VcsItemConfig,
    ) {
    }

    /** Checked status of vcs item. */
    abstract get checked(): boolean;

    abstract toggle(emitEvent: boolean): void;

    abstract select(emitEvent: boolean): void;

    abstract deselect(emitEvent: boolean): void;

    focus(): void {
        this._elementRef.nativeElement.focus();
    }

    protected emitEvent(event: VcsItemEvent): void {
        this._ref.events.next(event);
    }
}


/**
 * References to a vcs item.
 */
export class VcsItemRef<T extends VcsItem> {
    /** Vcs item component type. */
    component: Type<T>;

    /** Vcs item component instance. */
    componentInstance: T;

    /** Pane element portal. */
    panePortal: DomPortalOutlet;

    /** Pane element id. */
    paneElementId: string;

    readonly events = new Subject<VcsItemEvent>();

    _config: VcsItemConfig;

    /** Unique id for vcs item reference. */
    readonly id: string;

    constructor(
        config: VcsItemConfig,
    ) {
        this._config = {
            ...new VcsItemConfig(),
            ...config,
        };

        this.id = this._config.fileChanges
            .map(change => change.filePath)
            .join('-');
    }

    destroy(): void {
        this.events.complete();
    }
}


export interface VcsItemCreateResult<T extends VcsItem> {
    refs: VcsItemRef<T>[];
    usedFileChanges: VcsFileChange[];
}


/**
 * Abstraction for implement vcs item factory.
 */
export abstract class VcsItemFactory<T extends VcsItem> {
    abstract create(fileChanges: VcsFileChange[], ...extras: any[]): VcsItemCreateResult<T>;
}
