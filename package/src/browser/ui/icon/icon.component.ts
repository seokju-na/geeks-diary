import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostBinding,
    Input,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { ColorTypes } from '../style/color-types';


const colorTypeClassMap = {
    [ColorTypes.PRIMARY]: 'Icon--color-primary',
    [ColorTypes.ACCENT]: 'Icon--color-accent',
    [ColorTypes.WARN]: 'Icon--color-warn',
};


/**
 * Icon UI Component
 *
 * Using 'line-awesome' icons.
 * See icons: https://github.com/icons8/line-awesome
 */
@Component({
    selector: 'gd-icon',
    templateUrl: './icon.component.html',
    styleUrls: ['./icon.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent implements OnInit {
    @Input()
    get iconName() {
        return this._iconName;
    }
    set iconName(name: string) {
        const hostEl = this.getHostElement();

        if (name) {
            this.removePreviousIconClasses();

            hostEl.classList.add('la', this.getIconClassName(name));
            this._iconName = name;
        }
    }

    @Input()
    get color() {
        return this._color;
    }
    set color(type: string) {
        this.resetColorClasses();

        const hostEl = this.getHostElement();
        const className = colorTypeClassMap[type];

        if (className) {
            hostEl.classList.add(className);
        }

        this._color = type as ColorTypes;
    }

    @Input() bigSize: boolean = false;

    @HostBinding('attr.role') private roleAttr = 'img';
    @HostBinding('class.Icon') private className = true;

    @HostBinding('class.Icon--size-big')
    private get bigSizeClassName() {
        return this.bigSize;
    }

    private _iconName: string;
    private _color: ColorTypes;

    constructor(public _elementRef: ElementRef) {
    }

    ngOnInit(): void {
    }

    private getHostElement(): HTMLElement {
        return this._elementRef.nativeElement;
    }

    private getIconClassName(name: string): string {
        return `la-${name}`;
    }

    private removePreviousIconClasses(): void {
        const hostEl = this.getHostElement();
        const className = this.getIconClassName(this._iconName);

        hostEl.classList.remove('la');

        if (hostEl.classList.contains(className)) {
            hostEl.classList.remove(className);
        }
    }

    private resetColorClasses(): void {
        const hostEl = this.getHostElement();
        const classes = Object.values(colorTypeClassMap);

        hostEl.classList.remove(...classes);
    }
}
