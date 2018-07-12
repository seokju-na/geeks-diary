import { ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ViewEncapsulation } from '@angular/core';


const BUTTON_HOST_ATTRIBUTES = [
    'gd-button',
    'gd-flat-button',
    'gd-primary-button',
];


const buttonAttrClassMap = {
    'gd-button': 'Button--type-normal',
    'gd-flat-button': 'Button--type-flat',
    'gd-primary-button': 'Button--type-primary',
};


/**
 * Button UI Component
 *
 * Button's properties are static.
 * Once set, it can not be changed.
 * It is not uncommon to change the styles of button dynamically.
 */
@Component({
    selector: 'button[gd-button], button[gd-flat-button], button[gd-primary-button]',
    templateUrl: './button.component.html',
    styleUrls: ['./button.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class ButtonComponent implements OnInit {
    @Input() bigSize: boolean = false;
    @Input() iconContains: string = 'none';

    /** Remove focus css style if it is 'true'. */
    @Input() focusHidden = false;

    constructor(
        public _elementRef: ElementRef,
    ) {
    }

    ngOnInit(): void {
        const hostEl: HTMLElement = this._elementRef.nativeElement;

        hostEl.classList.add('Button');

        // Set class for button type.
        for (const attr of BUTTON_HOST_ATTRIBUTES) {
            if (this._hasHostAttributes(attr)) {
                hostEl.classList.add(buttonAttrClassMap[attr]);
            }
        }

        // Set class for big size button.
        if (this.bigSize) {
            hostEl.classList.add('Button--size-big');
        }

        // Set class for icon contains button.
        if (this.iconContains !== 'none') {
            if (this.iconContains === 'left') {
                hostEl.classList.add('Button--icon-left');
            } else if (this.iconContains === 'right') {
                hostEl.classList.add('Button--icon-right');
            }
        }

        // Set class for focus hidden option.
        if (this.focusHidden) {
            hostEl.classList.add('Button--focusHidden');
        }
    }

    private _getHostElement() {
        return this._elementRef.nativeElement;
    }

    private _hasHostAttributes(...attributes: string[]): boolean {
        return attributes.some(attribute => this._getHostElement().hasAttribute(attribute));
    }
}
