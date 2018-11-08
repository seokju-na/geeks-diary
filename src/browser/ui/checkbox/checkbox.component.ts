/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    NgZone,
    OnDestroy,
    Optional,
    Output,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CHECKBOX_CLICK_ACTION, CheckboxClickAction } from './checkbox-config';


let uniqueId = 0;


/** Change event object emitted by Checkbox. */
export class CheckboxChange {
    /** The source Checkbox of the event. */
    source: CheckboxComponent;
    /** The new `checked` value of the checkbox. */
    checked: boolean;
}


/**
 * A material design checkbox component. Supports all of the functionality of an HTML5 checkbox,
 * and exposes a similar API. A MatCheckbox can be either checked, unchecked, indeterminate, or
 * disabled. Note that all additional accessibility attributes are taken care of by the component,
 * so there is no need to provide them yourself. However, if you want to omit a label and still
 * have the checkbox be accessible, you may supply an [aria-label] input.
 * See: https://material.io/design/components/selection-controls.html
 */
@Component({
    selector: 'gd-checkbox',
    exportAs: 'gdCheckbox',
    templateUrl: './checkbox.component.html',
    styleUrls: ['./checkbox.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: CheckboxComponent,
            multi: true,
        },
    ],
    host: {
        'class': 'Checkbox',
        '[class.Checkbox--checked]': 'checked',
        '[class.Checkbox--indeterminate]': 'indeterminate',
        '[class.Checkbox--disabled]': 'disabled',
        '[id]': 'id',
        '[attr.tabindex]': 'null',
    },
})
export class CheckboxComponent implements ControlValueAccessor, OnDestroy {
    /** Name value will be applied to the input element if present */
    @Input() name: string | null = null;

    /** The value attribute of the native input element */
    @Input() value: string;

    /** Event emitted when the checkbox's `checked` value changes. */
    @Output() readonly change = new EventEmitter<CheckboxChange>();

    /** Event emitted when the checkbox's `indeterminate` value changes. */
    @Output() readonly indeterminateChange = new EventEmitter<boolean>();

    /** The native `<input type="checkbox">` element */
    @ViewChild('input') _inputElement: ElementRef<HTMLInputElement>;

    /**
     * Attached to the aria-label attribute of the host element. In most cases, arial-labelledby will
     * take precedence so this may be omitted.
     */
    @Input('aria-label') ariaLabel: string = '';

    /**
     * Users can specify the `aria-labelledby` attribute which will be forwarded to the input element
     */
    @Input('aria-labelledby') ariaLabelledby: string | null = null;

    private _uniqueId: string = `gd-chceckbox-${uniqueId++}`;

    /** A unique id for the checkbox input. If none is supplied, it will be auto-generated. */
    @Input() id: string = this._uniqueId;

    constructor(
        public _elementRef: ElementRef<HTMLElement>,
        private changeDetectorRef: ChangeDetectorRef,
        private focusMonitor: FocusMonitor,
        private ngZone: NgZone,
        @Optional() @Inject(CHECKBOX_CLICK_ACTION) private _clickAction: CheckboxClickAction,
    ) {
        this.focusMonitor.monitor(this._elementRef.nativeElement, true).subscribe((focusOrigin) => {
            if (!focusOrigin) {
                // When a focused element becomes disabled, the browser *immediately* fires a blur event.
                // Angular does not expect events to be raised during change detection, so any state change
                // (such as a form control's 'ng-touched') will cause a changed-after-checked error.
                // See https://github.com/angular/angular/issues/17793. To work around this, we defer
                // telling the form control it has been touched until the next tick.
                Promise.resolve().then(() => this._onTouched());
            }
        });
    }

    private _checked: boolean = false;

    /**
     * Whether the checkbox is checked.
     */
    @Input()
    get checked(): boolean {
        return this._checked;
    }

    set checked(value: boolean) {
        if (value !== this.checked) {
            this._checked = value;
            this.changeDetectorRef.markForCheck();
        }
    }

    private _disabled: boolean = false;

    /**
     * Whether the checkbox is disabled. This fully overrides the implementation provided by
     * mixinDisabled, but the mixin is still required because mixinTabIndex requires it.
     */
    @Input()
    get disabled() {
        return this._disabled;
    }

    set disabled(value: any) {
        const newValue = coerceBooleanProperty(value);

        if (newValue !== this.disabled) {
            this._disabled = newValue;
            this.changeDetectorRef.markForCheck();
        }
    }

    private _indeterminate: boolean = false;

    /**
     * Whether the checkbox is indeterminate. This is also known as "mixed" mode and can be used to
     * represent a checkbox with three states, e.g. a checkbox that represents a nested list of
     * checkable items. Note that whenever checkbox is manually clicked, indeterminate is immediately
     * set to false.
     */
    @Input()
    get indeterminate(): boolean {
        return this._indeterminate;
    }

    set indeterminate(value: boolean) {
        const changed = value !== this._indeterminate;
        this._indeterminate = value;

        if (changed) {
            this.indeterminateChange.emit(this._indeterminate);
        }
    }

    get inputId(): string {
        return `${this.id || this._uniqueId}-input`;
    }

    /**
     * Called when the checkbox is blurred. Needed to properly implement ControlValueAccessor.
     * @docs-private
     */
    /* tslint:disable */
    _onTouched: () => any = () => {
    };

    /* tslint:enable */

    ngOnDestroy(): void {
        this.focusMonitor.stopMonitoring(this._elementRef.nativeElement);
    }

    // Implemented as part of ControlValueAccessor.
    writeValue(value: any): void {
        this.checked = !!value;
    }

    // Implemented as part of ControlValueAccessor.
    registerOnChange(fn: (value: any) => void): void {
        this._controlValueAccessorChangeFn = fn;
    }

    // Implemented as part of ControlValueAccessor.
    registerOnTouched(fn: any): void {
        this._onTouched = fn;
    }

    // Implemented as part of ControlValueAccessor.
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    /** Toggles the `checked` state of the checkbox. */
    toggle(): void {
        this.checked = !this.checked;
    }

    _getAriaChecked(): 'true' | 'false' | 'mixed' {
        return this.checked ? 'true' : (this.indeterminate ? 'mixed' : 'false');
    }

    /** Method being called whenever the label text changes. */
    _onLabelTextChange(): void {
        // Since the event of the `cdkObserveContent` directive runs outside of the zone, the checkbox
        // component will be only marked for check, but no actual change detection runs automatically.
        // Instead of going back into the zone in order to trigger a change detection which causes
        // *all* components to be checked (if explicitly marked or not using OnPush), we only trigger
        // an explicit change detection for the checkbox view and it's children.
        this.changeDetectorRef.detectChanges();
    }

    /**
     * Event handler for checkbox input element.
     * Toggles checked state if element is not disabled.
     * Do not toggle on (change) event since IE doesn't fire change event when
     *   indeterminate checkbox is clicked.
     * @param event
     */
    _onInputClick(event: Event): void {
        // We have to stop propagation for click events on the visual hidden input element.
        // By default, when a user clicks on a label element, a generated click event will be
        // dispatched on the associated input element. Since we are using a label element as our
        // root container, the click event on the `checkbox` will be executed twice.
        // The real click event will bubble up, and the generated click event also tries to bubble up.
        // This will lead to multiple click events.
        // Preventing bubbling for the second event will solve that issue.
        event.stopPropagation();

        // If resetIndeterminate is false, and the current state is indeterminate, do nothing on click
        if (!this.disabled && this._clickAction !== 'noop') {
            // When user manually click on the checkbox, `indeterminate` is set to false.
            if (this.indeterminate && this._clickAction !== 'check') {

                Promise.resolve().then(() => {
                    this._indeterminate = false;
                    this.indeterminateChange.emit(this._indeterminate);
                });
            }

            this.toggle();

            // Emit our custom change event if the native input emitted one.
            // It is important to only emit it, if the native input triggered one, because
            // we don't want to trigger a change event, when the `checked` variable changes for example.
            this._emitChangeEvent();
        } else if (!this.disabled && this._clickAction === 'noop') {
            // Reset native input when clicked with noop. The native checkbox becomes checked after
            // click, reset it to be align with `checked` value of `mat-checkbox`.
            this._inputElement.nativeElement.checked = this.checked;
            this._inputElement.nativeElement.indeterminate = this.indeterminate;
        }
    }

    /** Focuses the checkbox. */
    focus(): void {
        this.focusMonitor.focusVia(this._inputElement.nativeElement, 'keyboard');
    }

    _onInteractionEvent(event: Event): void {
        // We always have to stop propagation on the change event.
        // Otherwise the change event, from the input element, will bubble up and
        // emit its event object to the `change` output.
        event.stopPropagation();
    }

    /* tslint:disable */
    private _controlValueAccessorChangeFn: (value: any) => void = () => {
    };

    /* tslint:enable */

    private _emitChangeEvent() {
        const event = new CheckboxChange();
        event.source = this;
        event.checked = this.checked;

        this._controlValueAccessorChangeFn(this.checked);
        this.change.emit(event);
    }
}
