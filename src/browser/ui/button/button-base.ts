import { ElementRef, HostBinding, Input } from '@angular/core';
import { ColorTheme } from '../style';


export const BUTTON_HOST_ATTRIBUTES = [
    'gd-icon-button',
    'gd-flat-button',
];

export const BUTTON_HOST_ATTRIBUTE_CLASS_NAME_MAP = {
    'gd-icon-button': 'IconButton',
    'gd-flat-button': 'FlatButton',
};


export type ButtonIconContainsPosition = 'left' | 'right' | null;


export abstract class ButtonBase<T extends HTMLElement> {
    protected constructor(protected elementRef: ElementRef<T>) {
        // For each of the variant selectors that is prevent in the button's host
        // attributes, add the correct corresponding class.
        for (const attr of BUTTON_HOST_ATTRIBUTES) {
            if (this.hasHostAttributes(attr)) {
                this.hostElement.classList.add(BUTTON_HOST_ATTRIBUTE_CLASS_NAME_MAP[attr]);
            }
        }

        this.color = 'normal';
    }

    protected _color: ColorTheme;

    @Input()
    get color(): ColorTheme {
        return this._color;
    }

    set color(color: ColorTheme) {
        this.updateColorClassName(color);
    }

    /** Whether if show spinner. */
    @Input() showSpinner: boolean = false;

    /** Whether if focus hidden. */
    @Input() focusHidden: boolean = false;

    /** Icon contains position. */
    @Input() iconContains: ButtonIconContainsPosition = null;

    @HostBinding('class.Button') private baseClass = true;

    @HostBinding('class.Button--showSpinner')
    private get showSpinnerClass() {
        return this.showSpinner;
    }

    @HostBinding('class.Button--focusHidden')
    private get focusHiddenClass() {
        return this.focusHidden;
    }

    @HostBinding('class.Button--iconContains-left')
    private get iconContainsLeftClass() {
        return this.iconContains === 'left';
    }

    @HostBinding('class.Button--iconContains-right')
    private get iconContainsRightClass() {
        return this.iconContains === 'right';
    }

    get hostElement(): T {
        return this.elementRef.nativeElement;
    }

    protected updateColorClassName(color: ColorTheme): void {
        const hostEl = this.hostElement;

        if (this._color) {
            const previousColorClassName = `Button--color-${this._color}`;

            // Remove previous button color class.
            if (hostEl.classList.contains(previousColorClassName)) {
                hostEl.classList.remove(previousColorClassName);
            }
        }

        const nextClassName = `Button--color-${color}`;

        hostEl.classList.add(nextClassName);

        this._color = color;
    }

    private hasHostAttributes(...attributes: string[]): boolean {
        return attributes.some(attribute => this.hostElement.hasAttribute(attribute));
    }
}
