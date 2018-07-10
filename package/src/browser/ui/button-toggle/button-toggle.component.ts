import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    Directive,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostBinding,
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


export const BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ButtonToggleGroupDirective),
    multi: true,
};

export class ButtonToggleChange {
    constructor(
        public source: ButtonToggleComponent,
        public value: any,
    ) {
    }
}

let _uniqueIdCounter = 0;


@Directive({
    selector: 'gd-button-toggle-group',
    providers: [
        BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR,
    ],
})
export class ButtonToggleGroupDirective implements ControlValueAccessor, OnInit, AfterContentInit {
    private _vertical = false;
    private _multiple = false;
    private _selectionModel: SelectionModel<ButtonToggleComponent>;

    private _rawValue: any;

    _controlValueAccessorChangeFn: (value: any) => void = () => {};

    /** onTouch function registered via registerOnTouch (ControlValueAccessor). */
    _onTouched: () => any = () => {};

    /** Child button toggle buttons. */
    @ContentChildren(forwardRef(() => ButtonToggleComponent))
    _buttonToggles: QueryList<ButtonToggleComponent>;

    /** `name` attribute for the underlying `input` element. */
    @Input()
    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;

        if (this._buttonToggles) {
            this._buttonToggles.forEach(toggle => toggle.name = this._name);
        }
    }

    private _name = `gd-button-toggle-group-${_uniqueIdCounter++}`;

    /** Whether the toggle group is vertical. */
    @Input()
    get vertical(): boolean {
        return this._vertical;
    }

    set vertical(value: boolean) {
        this._vertical = coerceBooleanProperty(value);
    }

    /** Value of the toggle group. */
    @Input()
    get value(): any {
        const selected = this._selectionModel ? this._selectionModel.selected : [];

        if (this.multiple) {
            return selected.map(toggle => toggle.value);
        }

        return selected[0] ? selected[0].value : undefined;
    }

    set value(newValue: any) {
        this._setSelectionByValue(newValue);
        this.valueChange.emit(this.value);
    }

    @Input() disabled: boolean;

    @Output() readonly valueChange = new EventEmitter<any>();

    /** Selected button toggles in the group. */
    get selected() {
        const selected = this._selectionModel.selected;
        return this.multiple ? selected : (selected[0] || null);
    }

    /** Whether multiple button toggles can be selected. */
    @Input()
    get multiple(): boolean {
        return this._multiple;
    }

    set multiple(value: boolean) {
        this._multiple = coerceBooleanProperty(value);
    }

    /** Event emitted when the group's value changes. */
    @Output() readonly change: EventEmitter<ButtonToggleChange> =
        new EventEmitter<ButtonToggleChange>();

    @HostBinding('attr.role') private roleAttr = 'group';
    @HostBinding('class.ButtonToggleGroup') private className = true;

    @HostBinding('class.ButtonToggleGroup--vertical')
    private get verticalClassName() {
        return this._vertical;
    }

    constructor(private _changeDetector: ChangeDetectorRef) {
    }

    ngOnInit(): void {
        this._selectionModel = new SelectionModel<ButtonToggleComponent>(
            this.multiple, undefined, false);
    }

    ngAfterContentInit(): void {
        this._selectionModel.select(...this._buttonToggles.filter(toggle => toggle.checked));
    }

    /**
     * Sets the model value. Implemented as part of ControlValueAccessor.
     * @param value Value to be set to the model.
     */
    writeValue(value: any): void {
        this.value = value;
        this._changeDetector.markForCheck();
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

        if (this._buttonToggles) {
            this._buttonToggles.forEach(toggle => toggle._markForCheck());
        }
    }

    /** Dispatch change event with current selection and group value. */
    _emitChangeEvent(): void {
        const selected = this.selected;
        const source = Array.isArray(selected) ? selected[selected.length - 1] : selected;
        const event = new ButtonToggleChange(source, this.value);
        this._controlValueAccessorChangeFn(event.value);
        this.change.emit(event);
    }

    /**
     * Syncs a button toggle's selected state with the model value.
     * @param toggle Toggle to be synced.
     * @param select Whether the toggle should be selected.
     * @param isUserInput Whether the change was a result of a user interaction.
     */
    _syncButtonToggle(toggle: ButtonToggleComponent, select: boolean, isUserInput = false): void {
        // Deselect the currently-selected toggle, if we're in single-selection
        // mode and the button being toggled isn't selected at the moment.
        if (!this.multiple && this.selected && !toggle.checked) {
            (this.selected as ButtonToggleComponent).checked = false;
        }

        if (select) {
            this._selectionModel.select(toggle);
        } else {
            this._selectionModel.deselect(toggle);
        }

        // Only emit the change event for user input.
        if (isUserInput) {
            this._emitChangeEvent();
        }

        // Note: we emit this one no matter whether it was a user interaction, because
        // it is used by Angular to sync up the two-way data binding.
        this.valueChange.emit(this.value);
    }

    /** Checks whether a button toggle is selected. */
    _isSelected(toggle: ButtonToggleComponent): boolean {
        return this._selectionModel.isSelected(toggle);
    }

    /** Determines whether a button toggle should be checked on init. */
    _isPrechecked(toggle: ButtonToggleComponent): boolean {
        if (typeof this._rawValue === 'undefined') {
            return false;
        }

        if (this.multiple && Array.isArray(this._rawValue)) {
            return this._rawValue.some(value => toggle.value != null && value === toggle.value);
        }

        return toggle.value === this._rawValue;
    }

    /** Updates the selection state of the toggles in the group based on a value. */
    private _setSelectionByValue(value: any | any[]): void {
        this._rawValue = value;

        if (!this._buttonToggles) {
            return;
        }

        if (this.multiple && value) {
            if (!Array.isArray(value)) {
                throw Error('Value must be an array in multiple-selection mode.');
            }

            this._clearSelection();
            value.forEach((currentValue: any) => this._selectValue(currentValue));
        } else {
            this._clearSelection();
            this._selectValue(value);
        }
    }

    /** Clears the selected toggles. */
    private _clearSelection(): void {
        this._selectionModel.clear();
        this._buttonToggles.forEach(toggle => toggle.checked = false);
    }

    /** Selects a value if there's a toggle that corresponds to it. */
    private _selectValue(value: any): void {
        const correspondingOption = this._buttonToggles.find(toggle => {
            return toggle.value != null && toggle.value === value;
        });

        if (correspondingOption) {
            correspondingOption.checked = true;
            this._selectionModel.select(correspondingOption);
        }
    }
}

@Component({
    selector: 'gd-button-toggle',
    templateUrl: './button-toggle.component.html',
    styleUrls: ['./button-toggle.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class ButtonToggleComponent implements OnInit, OnDestroy {
    private _isSingleSelector = false;
    private _checked = false;

    @Input() id: string;
    @Input() value: any;
    @Input() name: string;
    @Input() ariaLabel: string;
    @Input() ariaLabelledby: string | null = null;

    @ViewChild('button') _buttonEl: ElementRef<HTMLButtonElement>;

    buttonToggleGroup: ButtonToggleGroupDirective;

    get buttonId(): string {
        return `${this.id}-button`;
    }

    @Input()
    get checked(): boolean {
        return this.buttonToggleGroup ? this.buttonToggleGroup._isSelected(this) : this._checked;
    }
    set checked(value: boolean) {
        const newValue = coerceBooleanProperty(value);

        if (newValue !== this._checked) {
            this._checked = newValue;

            if (this.buttonToggleGroup) {
                this.buttonToggleGroup._syncButtonToggle(this, this._checked);
            }

            this._changeDetectorRef.markForCheck();
        }
    }

    /** Whether the button is disabled. */
    @Input()
    get disabled(): boolean {
        return this._disabled || (this.buttonToggleGroup && this.buttonToggleGroup.disabled);
    }
    set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value);
    }

    private _disabled: boolean = false;

    @HostBinding('class.ButtonToggle') private className = true;

    @HostBinding('class.ButtonToggle--standalone')
    private get standaloneClassName() {
        return !this.buttonToggleGroup;
    }

    @HostBinding('class.ButtonToggle--checked')
    private get checkedClassName() {
        return this.checked;
    }

    @HostBinding('class.ButtonToggle--disabled')
    private get disabledClassName() {
        return this.disabled;
    }

    @HostBinding('attr.id')
    private get attrId() {
        return this.id;
    }

    /** Event emitted when the group value changes. */
    @Output() readonly change: EventEmitter<ButtonToggleChange> =
        new EventEmitter<ButtonToggleChange>();

    constructor(
        @Optional() toggleGroup: ButtonToggleGroupDirective,
        private _changeDetectorRef: ChangeDetectorRef,
        private _elementRef: ElementRef<HTMLElement>,
        private _focusMonitor: FocusMonitor,
    ) {

        this.buttonToggleGroup = toggleGroup;
    }

    ngOnInit(): void {
        this._isSingleSelector = this.buttonToggleGroup && !this.buttonToggleGroup.multiple;
        this.id = this.id || `gd-button-toggle-${_uniqueIdCounter++}`;

        if (this._isSingleSelector) {
            this.name = this.buttonToggleGroup.name;
        }

        if (this.buttonToggleGroup && this.buttonToggleGroup._isPrechecked(this)) {
            this.checked = true;
        }

        this._focusMonitor.monitor(this._elementRef.nativeElement, true);
    }

    ngOnDestroy(): void {
        this._focusMonitor.stopMonitoring(this._elementRef.nativeElement);
    }

    /** Focuses the button. */
    focus(): void {
        this._buttonEl.nativeElement.focus();
    }

    /** Checks the button toggle due to an interaction with the underlying native button. */
    _onButtonClick() {
        const newChecked = this._isSingleSelector ? true : !this._checked;

        if (newChecked !== this._checked) {
            this._checked = newChecked;
            if (this.buttonToggleGroup) {
                this.buttonToggleGroup._syncButtonToggle(this, this._checked, true);
                this.buttonToggleGroup._onTouched();
            }
        }
        // Emit a change event when it's the single selector
        this.change.emit(new ButtonToggleChange(this, this.value));
    }

    /**
     * Marks the button toggle as needing checking for change detection.
     * This method is exposed because the parent button toggle group will directly
     * update bound properties of the radio button.
     */
    _markForCheck(): void {
        // When the group value changes, the button will not be notified.
        // Use `markForCheck` to explicit update button toggle's status.
        this._changeDetectorRef.markForCheck();
    }
}
