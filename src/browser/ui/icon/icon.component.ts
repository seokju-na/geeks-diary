import { ChangeDetectionStrategy, Component, ElementRef, Input, ViewEncapsulation } from '@angular/core';


@Component({
    selector: 'gd-icon',
    templateUrl: './icon.component.html',
    styleUrls: ['./icon.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'class': 'Icon',
        '[class.Icon--size-big]': 'bigSize',
        'role': 'img',
    },
})
export class IconComponent {
    @Input() bigSize = false;

    private _iconName: string;

    constructor(private elementRef: ElementRef<HTMLElement>) {
        this.hostElement.classList.add('la');
    }

    @Input()
    get name() {
        return this._iconName;
    }

    set name(name: string) {
        this.updateIconClass(name);
    }

    get hostElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }

    private updateIconClass(name: string): void {
        if (this._iconName && this.hostElement.classList.contains(`la-${this._iconName}`)) {
            this.hostElement.classList.remove(`la-${this._iconName}`);
        }

        this.hostElement.classList.add(`la-${name}`);
        this._iconName = name;
    }
}
