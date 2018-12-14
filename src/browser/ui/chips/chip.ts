/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { FocusableOption } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { BACKSPACE, DELETE, SPACE } from '@angular/cdk/keycodes';
import {
    ContentChild,
    Directive,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    NgZone,
    OnDestroy,
    Output,
} from '@angular/core';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { ChipRemove } from './chip-injectors';


/** Represents an event fired on an individual `gd-chip`. */
export interface ChipEvent {
    /** The chip the event was fired on. */
    chip: ChipDirective;
}


/** Event object emitted by MatChip when selected or deselected. */
export class ChipSelectionChange {
    // noinspection JSValidateJSDoc
    constructor(
        /** Reference to the chip that emitted the event. */
        public source: ChipDirective,
        /** Whether the chip that emitted the event is selected. */
        public selected: boolean,
        /** Whether the selection change was a result of a user interaction. */
        public isUserInput = false,
    ) {
    }
}


@Directive({
    selector: 'gd-chip, [gd-chip]',
    exportAs: 'gdChip',
    host: {
        'class': 'Chip',
        '[class.Chip--selected]': 'selected',
        '[class.Chip--disabled]': 'disabled',
        '[attr.tabindex]': 'disabled ? null : -1',
        'role': 'option',
        '[attr.disabled]': 'disabled || null',
        '[attr.aria-disabled]': 'disabled.toString()',
        '[attr.aria-selected]': 'ariaSelected',
    },
})
export class ChipDirective implements FocusableOption, OnDestroy {
    private _disabled = false;

    @Input()
    get disabled() {
        return this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value);
    }

    protected _selected: boolean = false;

    /** Whether the chip is selected. */
    @Input()
    get selected(): boolean {
        return this._selected;
    }

    set selected(value: boolean) {
        const coercedValue = coerceBooleanProperty(value);

        if (coercedValue !== this._selected) {
            this._selected = coercedValue;
            this._dispatchSelectionChange();
        }
    }

    protected _value: any;

    /** The value of the chip. Defaults to the content inside `<mat-chip>` tags. */
    @Input()
    get value(): any {
        return this._value !== undefined
            ? this._value
            : this._elementRef.nativeElement.textContent;
    }

    set value(value: any) {
        this._value = value;
    }

    protected _selectable: boolean = true;

    /**
     * Whether or not the chip is selectable. When a chip is not selectable,
     * changes to its selected state are always ignored. By default a chip is
     * selectable, and it becomes non-selectable if its parent chip list is
     * not selectable.
     */
    @Input()
    get selectable(): boolean {
        return this._selectable && this.chipListSelectable;
    }

    set selectable(value: boolean) {
        this._selectable = coerceBooleanProperty(value);
    }

    protected _removable: boolean = true;

    /**
     * Determines whether or not the chip displays the remove styling and emits (removed) events.
     */
    @Input()
    get removable(): boolean {
        return this._removable;
    }

    set removable(value: boolean) {
        this._removable = coerceBooleanProperty(value);
    }

    /** The ARIA selected applied to the chip. */
    get ariaSelected(): string | null {
        return this.selectable ? this.selected.toString() : null;
    }

    /** Whether the chip has focus. */
    _hasFocus: boolean = false;

    /** Whether the chip list is selectable */
    chipListSelectable: boolean = true;

    /** The chip's remove toggler. */
    @ContentChild(ChipRemove) removeIcon: ChipRemove;

    /** Emits when the chip is focused. */
    readonly _onFocus = new Subject<ChipEvent>();

    /** Emits when the chip is blured. */
    readonly _onBlur = new Subject<ChipEvent>();

    /** Emitted when the chip is selected or deselected. */
    @Output() readonly selectionChange = new EventEmitter<ChipSelectionChange>();

    /** Emitted when the chip is destroyed. */
    @Output() readonly destroyed = new EventEmitter<ChipEvent>();

    /** Emitted when a chip is to be removed. */
    @Output() readonly removed = new EventEmitter<ChipEvent>();

    constructor(
        public _elementRef: ElementRef<HTMLElement>,
        private _ngZone: NgZone,
    ) {
    }

    ngOnDestroy(): void {
        this.destroyed.emit({ chip: this });
    }

    /** Selects the chip. */
    select(): void {
        if (!this._selected) {
            this._selected = true;
            this._dispatchSelectionChange();
        }
    }

    /** Deselects the chip. */
    deselect(): void {
        if (this._selected) {
            this._selected = false;
            this._dispatchSelectionChange();
        }
    }

    /** Select this chip and emit selected event */
    selectViaInteraction(): void {
        if (!this._selected) {
            this._selected = true;
            this._dispatchSelectionChange(true);
        }
    }

    /** Toggles the current selected state of this chip. */
    toggleSelected(isUserInput: boolean = false): boolean {
        this._selected = !this.selected;
        this._dispatchSelectionChange(isUserInput);
        return this.selected;
    }

    /** Allows for programmatic focusing of the chip. */
    @HostListener('focus')
    focus(): void {
        if (!this._hasFocus) {
            this._elementRef.nativeElement.focus();
            this._onFocus.next({ chip: this });
        }
        this._hasFocus = true;
    }

    /**
     * Allows for programmatic removal of the chip. Called by the MatChipList when the DELETE or
     * BACKSPACE keys are pressed.
     *
     * Informs any listeners of the removal request. Does not remove the chip from the DOM.
     */
    remove(): void {
        if (this.removable) {
            this.removed.emit({ chip: this });
        }
    }

    /** Handles click events on the chip. */
    @HostListener('click', ['$event'])
    _handleClick(event: Event) {
        if (this.disabled) {
            event.preventDefault();
        } else {
            event.stopPropagation();
        }
    }

    /** Handle custom key presses. */
    @HostListener('keydown', ['$event'])
    _handleKeydown(event: KeyboardEvent): void {
        if (this.disabled) {
            return;
        }

        switch (event.keyCode) {
            case DELETE:
            case BACKSPACE:
                // If we are removable, remove the focused chip
                this.remove();
                // Always prevent so page navigation does not occur
                event.preventDefault();
                break;
            case SPACE:
                // If we are selectable, toggle the focused chip
                if (this.selectable) {
                    this.toggleSelected(true);
                }

                // Always prevent space from scrolling the page since the list has focus
                event.preventDefault();
                break;
        }
    }

    @HostListener('blur')
    _blur(): void {
        // When animations are enabled, Angular may end up removing the chip from the DOM a little
        // earlier than usual, causing it to be blurred and throwing off the logic in the chip list
        // that moves focus not the next item. To work around the issue, we defer marking the chip
        // as not focused until the next time the zone stabilizes.
        this._ngZone.onStable
            .asObservable()
            .pipe(take(1))
            .subscribe(() => {
                this._ngZone.run(() => {
                    this._hasFocus = false;
                    this._onBlur.next({ chip: this });
                });
            });
    }

    private _dispatchSelectionChange(isUserInput = false) {
        this.selectionChange.emit({
            source: this,
            isUserInput,
            selected: this._selected,
        });
    }
}


/**
 * Applies proper (click) support and adds styling for use with the Material Design "cancel" icon
 * available at https://material.io/icons/#ic_cancel.
 *
 * Example:
 *
 *     `<gd-chip>
 *       <gd-icon gdChipRemove name="cancel"></gd-icon>
 *     </gd-chip>`
 *
 * You *may* use a custom icon, but you may need to override the `gd-chip-remove` positioning
 * styles to properly center the icon within the chip.
 */
@Directive({
    selector: '[gdChipRemove]',
    host: {
        'class': 'ChipRemove',
    },
    providers: [
        { provide: ChipRemove, useExisting: ChipRemoveDirective },
    ],
})
export class ChipRemoveDirective extends ChipRemove {
    constructor(protected _parentChip: ChipDirective) {
        super();
    }

    /** Calls the parent chip's public `remove()` method if applicable. */
    @HostListener('click', ['$event'])
    _handleClick(event: Event): void {
        if (this._parentChip.removable) {
            this._parentChip.remove();
        }

        // We need to stop event propagation because otherwise the event will bubble up to the
        // form field and cause the `onContainerClick` method to be invoked. This method would then
        // reset the focused chip that has been focused after chip removal. Usually the parent
        // the parent click listener of the `MatChip` would prevent propagation, but it can happen
        // that the chip is being removed before the event bubbles up.
        event.stopPropagation();
    }
}
