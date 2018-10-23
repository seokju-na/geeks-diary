import { Highlightable } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ENTER, SPACE } from '@angular/cdk/keycodes';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    Output,
    ViewEncapsulation,
} from '@angular/core';


let uniqueId = 0;


export class AutocompleteItemSelectionChange {
    constructor(
        /** Reference to the item that emitted the event. */
        public readonly source: AutocompleteItemComponent,
        /** Whether the change in the item's value was a result of a user action. */
        public readonly isUserInput: boolean = false,
    ) {
    }
}


@Component({
    selector: 'gd-autocomplete-item',
    exportAs: 'gdAutocompleteItem',
    host: {
        'class': 'AutocompleteItem',
        'role': 'option',
        '[attr.tabindex]': '_getTabIndex()',
        '[class.AutocompleteItem--selected]': 'selected',
        '[class.AutocompleteItem--active]': 'active',
        '[id]': 'id',
        '[attr.aria-selected]': 'selected.toString()',
        '[attr.aria-disabled]': 'disabled.toString()',
        '[class.AutocompleteItem--disabled]': 'disabled',
    },
    styleUrls: ['./autocomplete-item.component.scss'],
    templateUrl: './autocomplete-item.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteItemComponent implements Highlightable {
    /** The form value of the item. */
    @Input() value: any;

    /** The unique ID of the item. */
    @Input() id: string = `mat-item-${uniqueId++}`;

    /** Event emitted when the item is selected or deselected. */
    @Output() readonly selectionChanged = new EventEmitter<AutocompleteItemSelectionChange>();

    constructor(
        private elementRef: ElementRef<HTMLElement>,
        private changeDetectorRef: ChangeDetectorRef,
    ) {
    }

    private _active = false;

    /**
     * Whether or not the item is currently active and ready to be selected.
     * An active item displays styles as if it is focused, but the
     * focus is actually retained somewhere else. This comes in handy
     * for components like autocomplete where focus must remain on the input.
     */
    get active(): boolean {
        return this._active;
    }

    private _disabled = false;

    /** Whether the item is disabled. */
    @Input()
    get disabled() {
        return this._disabled;
    }

    set disabled(value: any) {
        this._disabled = coerceBooleanProperty(value);
    }

    private _selected = false;

    /** Whether or not the item is currently selected. */
    get selected(): boolean {
        return this._selected;
    }

    /** Selects the item. */
    select(): void {
        if (!this._selected) {
            this._selected = true;
            this.changeDetectorRef.markForCheck();
            this.emitSelectionChangeEvent();
        }
    }

    /** Deselects the item. */
    deselect(): void {
        if (this._selected) {
            this._selected = false;
            this.changeDetectorRef.markForCheck();
            this.emitSelectionChangeEvent();
        }
    }

    /** Sets focus onto this item. */
    focus(): void {
        const element = this.elementRef.nativeElement;

        if (typeof element.focus === 'function') {
            element.focus();
        }
    }

    /**
     * This method sets display styles on the item to make it appear
     * active. This is used by the ActiveDescendantKeyManager so key
     * events will display the proper items as active on arrow key events.
     */
    setActiveStyles(): void {
        if (!this._active) {
            this._active = true;
            this.changeDetectorRef.markForCheck();
        }
    }

    /**
     * This method removes display styles on the item that made it appear
     * active. This is used by the ActiveDescendantKeyManager so key
     * events will display the proper items as active on arrow key events.
     */
    setInactiveStyles(): void {
        if (this._active) {
            this._active = false;
            this.changeDetectorRef.markForCheck();
        }
    }

    /** Returns the correct tabindex for the item depending on disabled state. */
    _getTabIndex(): string {
        return this.disabled ? '-1' : '0';
    }

    /** Ensures the item is selected when activated from the keyboard. */
    @HostListener('keydown', ['$event'])
    _handleKeyDown(event: KeyboardEvent): void {
        if (event.keyCode === ENTER || event.keyCode === SPACE) {
            this._selectViaInteraction();

            // Prevent the page from scrolling down and form submits.
            event.preventDefault();
        }
    }

    /**
     * `Selects the item while indicating the selection came from the user. Used to
     * determine if the select's view -> model callback should be invoked.`
     */
    @HostListener('click')
    _selectViaInteraction(): void {
        if (!this.disabled) {
            this._selected = true;
            this.changeDetectorRef.markForCheck();
            this.emitSelectionChangeEvent(true);
        }
    }

    /** Emits the selection change event. */
    private emitSelectionChangeEvent(isUserInput = false): void {
        this.selectionChanged.emit(new AutocompleteItemSelectionChange(this, isUserInput));
    }
}


/**
 * Determines the position to which to scroll a panel in order for an item to be into view.
 * @param itemIndex Index of the item to be scrolled into the view.
 * @param itemHeight Height of the items.
 * @param currentScrollPosition Current scroll position of the panel.
 * @param panelHeight Height of the panel.
 * @docs-private
 */
export function _getItemScrollPosition(
    itemIndex: number,
    itemHeight: number,
    currentScrollPosition: number,
    panelHeight: number,
): number {
    const offset = itemIndex * itemHeight;

    if (offset < currentScrollPosition) {
        return offset;
    }

    if (offset + itemHeight > currentScrollPosition + panelHeight) {
        return Math.max(0, offset - panelHeight + itemHeight);
    }

    return currentScrollPosition;
}
