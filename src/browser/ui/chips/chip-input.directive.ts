/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ENTER } from '@angular/cdk/keycodes';
import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { ChipListComponent } from './chip-list.component';
import { ChipTextControl } from './chip-text-control';


/** Represents an input event on a `gdChipInput`. */
export interface ChipInputEvent {
    /** The native `<input>` element that the event is being fired for. */
    input: HTMLInputElement;

    /** The value of the input. */
    value: string;
}

// Increasing integer for generating unique ids.
let nextUniqueId = 0;


/**
 * Directive that adds chip-specific behaviors to an input element inside `<gd-form-field>`.
 * May be placed inside or outside of an `<gd-chip-list>`.
 */
@Directive({
    selector: 'input[gdChipInputFor]',
    exportAs: 'gdChipInput, gdChipInputFor',
    host: {
        'class': 'ChipInput',
        '[id]': 'id',
        '[attr.disabled]': 'disabled || null',
        '[attr.placeholder]': 'placeholder || null',
        '[attr.aria-invalid]': '_chipList && _chipList.ngControl ? _chipList.ngControl.invalid : null',
    },
})
export class ChipInputDirective implements ChipTextControl {
    _chipList: ChipListComponent;

    /** Register input for chip list */
    @Input('gdChipInputFor')
    set chipList(value: ChipListComponent) {
        if (value) {
            this._chipList = value;
            this._chipList.registerInput(this);
        }
    }

    _addOnBlur: boolean = false;

    /**
     * Whether or not the chipEnd event will be emitted when the input is blurred.
     */
    @Input('gdChipInputAddOnBlur')
    get addOnBlur(): boolean {
        return this._addOnBlur;
    }

    set addOnBlur(value: boolean) {
        this._addOnBlur = coerceBooleanProperty(value);
    }

    private _disabled: boolean = false;

    /** Whether the input is disabled. */
    @Input()
    get disabled(): boolean {
        return this._disabled || (this._chipList && this._chipList.disabled);
    }

    set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value);
    }

    /** Whether the input is empty. */
    get empty(): boolean {
        return !this._inputElement.value;
    }

    /** Whether the control is focused. */
    focused: boolean = false;

    /**
     * The list of key codes that will trigger a chipEnd event.
     *
     * Defaults to `[ENTER]`.
     */
    @Input('gdChipInputSeparatorKeyCodes')
    separatorKeyCodes: number[] | Set<number> = [ENTER];

    /** Emitted when a chip is to be added. */
    @Output('gdChipInputTokenEnd')
    chipEnd = new EventEmitter<ChipInputEvent>();

    /** The input's placeholder text. */
    @Input() placeholder: string = '';

    /** Unique id for the input. */
    @Input() id: string = `gd-chip-list-input-${nextUniqueId++}`;

    /** The native input element to which this directive is attached. */
    protected _inputElement: HTMLInputElement;

    constructor(
        protected _elementRef: ElementRef<HTMLInputElement>,
    ) {
        this._inputElement = this._elementRef.nativeElement as HTMLInputElement;
    }

    /** Utility method to make host definition/tests more clear. */
    @HostListener('keydown', ['$event'])
    _keydown(event?: KeyboardEvent): void {
        this._emitChipEnd(event);
    }

    /** Checks to see if the blur should emit the (chipEnd) event. */
    @HostListener('blur')
    _blur(): void {
        if (this.addOnBlur) {
            this._emitChipEnd();
        }
        this.focused = false;

        // Blur the chip list if it is not focused
        if (!this._chipList.focused) {
            this._chipList._blur();
        }
    }

    @HostListener('focus')
    _focus(): void {
        this.focused = true;
    }

    /** Checks to see if the (chipEnd) event needs to be emitted. */
    _emitChipEnd(event?: KeyboardEvent): void {
        if (!this._inputElement.value && !!event) {
            this._chipList._keydown(event);
        }

        if (!event || this._isSeparatorKey(event)) {
            this.chipEnd.emit({ input: this._inputElement, value: this._inputElement.value });

            if (event) {
                event.preventDefault();
            }
        }
    }

    /** Focuses the input. */
    focus(): void {
        this._inputElement.focus();
    }

    /** Checks whether a keycode is one of the configured separators. */
    private _isSeparatorKey(event: KeyboardEvent): boolean {
        const separators = this.separatorKeyCodes;
        const keyCode = event.keyCode;
        return Array.isArray(separators) ? separators.indexOf(keyCode) > -1 : separators.has(keyCode);
    }
}
