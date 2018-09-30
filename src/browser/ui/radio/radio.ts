import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    Directive,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    QueryList,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';


export class RadioChange {
    constructor(
        public source: RadioButtonComponent,
        public value: any,
    ) {
    }
}


export const RADIO_GROUP_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => RadioGroupDirective),
    multi: true,
};


let uniqueId = 0;


@Directive({
    selector: 'gd-radio-group',
    providers: [RADIO_GROUP_CONTROL_VALUE_ACCESSOR],
    host: {
        'class': 'RadioGroup',
        'role': 'radiogroup',
    },
})
export class RadioGroupDirective implements AfterContentInit, ControlValueAccessor {
    _controlValueAccessorChangeFn: (value: any) => void = () => {};
    onTouched: () => any = () => {};

    @Output() readonly change: EventEmitter<RadioChange> = new EventEmitter<RadioChange>();

    @ContentChildren(forwardRef(() => RadioButtonComponent), { descendants: true })
    _radios: QueryList<RadioButtonComponent>;

    /** Whether the `value` has been set to its initial value. */
    private _isInitialized: boolean = false;

    constructor(private changeDetector: ChangeDetectorRef) {
    }

    /** Selected value for the radio group. */
    private _value: any = null;

    @Input()
    get value(): any {
        return this._value;
    }

    set value(newValue: any) {
        if (this._value !== newValue) {
            // Set this before proceeding to ensure no circular loop occurs with selection.
            this._value = newValue;

            this.updateSelectedRadioFromValue();
            this._checkSelectedRadioButton();
        }
    }

    /** The HTML name attribute applied to radio buttons in this group. */
    private _name: string = `gd-radio-group-${uniqueId++}`;

    @Input()
    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
        this.updateRadioButtonNames();
    }

    /** The currently selected radio button. Should match value. */
    private _selected: RadioButtonComponent | null = null;

    @Input()
    get selected() {
        return this._selected;
    }

    set selected(selected: any | null) {
        this._selected = selected;
        this.value = selected ? selected.value : null;
        this._checkSelectedRadioButton();
    }

    private _disabled: boolean;

    /** Whether the radio group is disabled */
    @Input()
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
        this._markRadiosForCheck();
    }

    _checkSelectedRadioButton(): void {
        if (this._selected && !this._selected.checked) {
            this._selected.checked = true;
        }
    }

    ngAfterContentInit(): void {
        // Mark this component as initialized in AfterContentInit because the initial value can
        // possibly be set by NgModel on MatRadioGroup, and it is possible that the OnInit of the
        // NgModel occurs *after* the OnInit of the MatRadioGroup.
        this._isInitialized = true;
    }

    _touch(): void {
        if (this.onTouched) {
            this.onTouched();
        }
    }

    /** Dispatch change event with current selection and group value. */
    _emitChangeEvent(): void {
        if (this._isInitialized) {
            this.change.emit(new RadioChange(this._selected, this._value));
        }
    }

    /**
     * Sets the model value. Implemented as part of ControlValueAccessor.
     * @param value
     */
    writeValue(value: any) {
        this.value = value;
        this.changeDetector.markForCheck();
    }

    /**
     * Registers a callback to be triggered when the model value changes.
     * Implemented as part of ControlValueAccessor.
     * @param fn Callback to be registered.
     */
    registerOnChange(fn: (value: any) => void) {
        this._controlValueAccessorChangeFn = fn;
    }

    /**
     * Registers a callback to be triggered when the control is touched.
     * Implemented as part of ControlValueAccessor.
     * @param fn Callback to be registered.
     */
    registerOnTouched(fn: any) {
        this.onTouched = fn;
    }

    /**
     * Sets the disabled state of the control. Implemented as a part of ControlValueAccessor.
     * @param isDisabled Whether the control should be disabled.
     */
    setDisabledState(isDisabled: boolean) {
        this.disabled = isDisabled;
        this.changeDetector.markForCheck();
    }

    _markRadiosForCheck() {
        if (this._radios) {
            this._radios.forEach(radio => radio._markForCheck());
        }
    }

    private updateRadioButtonNames(): void {
        if (this._radios) {
            this._radios.forEach(radio => {
                radio.name = this.name;
            });
        }
    }

    /** Updates the `selected` radio button from the internal _value state. */
    private updateSelectedRadioFromValue(): void {
        // If the value already matches the selected radio, do nothing.
        const isAlreadySelected = this._selected !== null && this._selected.value === this._value;

        if (this._radios && !isAlreadySelected) {
            this._selected = null;
            this._radios.forEach(radio => {
                radio.checked = this.value === radio.value;
                if (radio.checked) {
                    this._selected = radio;
                }
            });
        }
    }
}


@Component({
    selector: 'gd-radio-button',
    templateUrl: './radio.html',
    styleUrls: ['./radio.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        'class': 'RadioButton',
        '[class.RadioButton--checked]': 'checked',
        '[attr.id]': 'id',
    },
})
export class RadioButtonComponent implements AfterViewInit, OnInit, OnDestroy {
    @Input() name: string;

    radioGroup: RadioGroupDirective;

    @Output() readonly change: EventEmitter<RadioChange> = new EventEmitter<RadioChange>();

    @ViewChild('input') _inputElement: ElementRef;

    private removeUniqueSelectionListener: () => void = () => {};

    constructor(
        @Optional() radioGroup: RadioGroupDirective,
        public _elementRef: ElementRef,
        private changeDetector: ChangeDetectorRef,
        private focusMonitor: FocusMonitor,
        private radioDispatcher: UniqueSelectionDispatcher,
    ) {

        this.radioGroup = radioGroup;

        this.removeUniqueSelectionListener =
            radioDispatcher.listen((id: string, name: string) => {
                if (id !== this.id && name === this.name) {
                    this.checked = false;
                }
            });
    }

    private _id: string = `gd-radio-button-${uniqueId++}`;

    @Input()
    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get inputId(): string {
        return `${this._id}-input`;
    }

    private _checked: boolean = false;

    @Input()
    get checked(): boolean {
        return this._checked;
    }

    set checked(value: boolean) {
        const newCheckedState = coerceBooleanProperty(value);
        if (this._checked !== newCheckedState) {
            this._checked = newCheckedState;

            if (newCheckedState && this.radioGroup && this.radioGroup.value !== this.value) {
                this.radioGroup.selected = this;
            } else if (!newCheckedState && this.radioGroup && this.radioGroup.value === this.value) {
                // When unchecking the selected radio button, update the selected radio
                // property on the group.
                this.radioGroup.selected = null;
            }

            if (newCheckedState) {
                // Notify all radio buttons with the same name to un-check.
                this.radioDispatcher.notify(this.id, this.name);
            }
            this.changeDetector.markForCheck();
        }
    }

    private _value: any = null;

    @Input()
    get value(): any {
        return this._value;
    }

    set value(value: any) {
        if (this._value !== value) {
            this._value = value;

            if (this.radioGroup !== null) {
                if (!this.checked) {
                    // Update checked when the value changed to match the radio group's value
                    this.checked = this.radioGroup.value === value;
                }
                if (this.checked) {
                    this.radioGroup.selected = this;
                }
            }
        }
    }

    ngOnInit(): void {
        if (this.radioGroup) {
            // If the radio is inside a radio group, determine if it should be checked
            this.checked = this.radioGroup.value === this._value;
            // Copy name from parent radio group
            this.name = this.radioGroup.name;
        }
    }

    ngAfterViewInit(): void {
        this.focusMonitor
            .monitor(this._inputElement.nativeElement)
            .subscribe(focusOrigin => this._onInputFocusChange(focusOrigin));
    }

    ngOnDestroy(): void {
        this.focusMonitor.stopMonitoring(this._inputElement.nativeElement);
        this.removeUniqueSelectionListener();
    }

    _onInputClick(event: Event): void {
        // We have to stop propagation for click events on the visual hidden input element.
        // By default, when a user clicks on a label element, a generated click event will be
        // dispatched on the associated input element. Since we are using a label element as our
        // root container, the click event on the `radio-button` will be executed twice.
        // The real click event will bubble up, and the generated click event also tries to bubble up.
        // This will lead to multiple click events.
        // Preventing bubbling for the second event will solve that issue.
        event.stopPropagation();
    }

    _onInputChange(event: Event): void {
        // We always have to stop propagation on the change event.
        // Otherwise the change event, from the input element, will bubble up and
        // emit its event object to the `change` output.
        event.stopPropagation();

        const groupValueChanged = this.radioGroup && this.value !== this.radioGroup.value;
        this.checked = true;
        this._emitChangeEvent();

        if (this.radioGroup) {
            this.radioGroup._controlValueAccessorChangeFn(this.value);
            this.radioGroup._touch();
            if (groupValueChanged) {
                this.radioGroup._emitChangeEvent();
            }
        }
    }

    _markForCheck(): void {
        this.changeDetector.markForCheck();
    }

    private _emitChangeEvent(): void {
        this.change.emit(new RadioChange(this, this._value));
    }

    @HostListener('focus')
    private onHostFocus(): void {
        this._inputElement.nativeElement.focus();
    }

    private _onInputFocusChange(origin: FocusOrigin): void {
        if (origin) {
            this._elementRef.nativeElement.classList.add('RadioButton--focused');
        } else {
            if (this.radioGroup) {
                this.radioGroup._touch();
            }

            this._elementRef.nativeElement.classList.remove('RadioButton--focused');
        }
    }
}
