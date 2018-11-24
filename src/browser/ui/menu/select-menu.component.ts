import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostListener,
    Input,
    Optional,
    Self,
    ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, FormGroupDirective, NgControl } from '@angular/forms';
import { FormFieldControl } from '../form-field/form-field-control';
import { MenuItem } from './menu-item';


let uniqueId = 0;


/**
 * UI for selecting values with menu.
 * Accepts values implemented with the MenuItem interface via FormControl.
 *
 * @example
 * <gd-form-field>
 *     <gd-select-menu
 *         formControlName="author"
 *         [gdMenuTrigger]="menu"
 *         placeholder="Select author..."></gd-select-menu>
 *
 *     <gd-menu #menu="gdMenu">
 *         <button gd-menu-item>author1</button>
 *         <button gd-menu-item>author2</button>
 *         <gd-menu-separator></gd-menu-separator>
 *         <button gd-menu-item iconName="plus">Add Author</button>
 *     </gd-menu>
 * </gd-form-field>
 */
@Component({
    selector: 'gd-select-menu',
    templateUrl: './select-menu.component.html',
    styleUrls: ['./select-menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        'class': 'SelectMenu',
        '[attr.id]': 'id',
        '[attr.tabindex]': 'disabled ? null : 0',
        '[class.SelectMenu--disabled]': 'disabled',
    },
    providers: [
        {
            provide: FormFieldControl,
            useExisting: SelectMenuComponent,
        },
    ],
})
export class SelectMenuComponent extends FormFieldControl implements ControlValueAccessor {
    @Input() placeholder: string = '';
    @Input() convertFn: (value: any) => MenuItem;
    private onChange: (value: any) => void;
    private onTouch: () => void;

    constructor(
        @Self() @Optional() public ngControl: NgControl,
        @Optional() parentForm: FormGroupDirective,
        public elementRef: ElementRef<HTMLElement>,
        private changeDetectorRef: ChangeDetectorRef,
    ) {
        super();

        // Note: we provide the value accessor through here, instead of
        // the `providers` to avoid running into a circular import.
        if (this.ngControl) {
            this.ngControl.valueAccessor = this;
        }
    }

    private _item: MenuItem | null = null;

    get item(): MenuItem {
        if (this._item && this.convertFn) {
            return this.convertFn(this._item);
        } else {
            return this._item;
        }
    }

    private _id: string = `gd-select-menu-${uniqueId++}`;

    @Input()
    get id() {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    private _disabled: boolean = false;

    @Input()
    get disabled() {
        return this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = value;
    }

    get isEmptyValue(): boolean {
        return !this._item;
    }

    writeValue(obj: any): void {
        this._item = obj;
        this.changeDetectorRef.markForCheck();
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this._disabled = isDisabled;
        this.changeDetectorRef.markForCheck();
    }

    @HostListener('focus')
    private handleFocus(): void {
        this.focused = true;
    }

    @HostListener('blur')
    private handleBlur(): void {
        this.focused = false;
    }
}
