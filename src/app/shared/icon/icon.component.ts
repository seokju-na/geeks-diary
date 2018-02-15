import { ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ViewEncapsulation } from '@angular/core';


@Component({
    selector: 'i[gd-icon]',
    templateUrl: './icon.component.html',
    styleUrls: ['./icon.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class IconComponent implements OnInit {
    @Input() name: string;
    @Input() size = 'regular';

    constructor(private elementRef: ElementRef) {
    }

    ngOnInit(): void {
        const host = this.elementRef.nativeElement;

        host.classList.add('la');
        host.classList.add(`la-${this.name}`);
        host.classList.add(`Icon--size-${this.size}`);
    }
}
