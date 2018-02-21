import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostBinding,
    Input,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';


@Component({
    selector: `span[gd-text], label[gd-text], div[gd-text], h1[gd-text], h2[gd-text], h3[gd-text],
    h4[gd-text], h5[gd-text], h6[gd-text]`,
    templateUrl: './text.component.html',
    styleUrls: ['./text.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class TextComponent implements OnInit {
    @HostBinding('class.Text') private textClassName = true;

    @Input() size = 'regular';
    @Input() weight = 'regular';

    constructor(private elementRef: ElementRef) {
    }

    ngOnInit(): void {
        const host = this.elementRef.nativeElement;

        host.classList.add(`Text--size-${this.size}`);
        host.classList.add(`Text--weight-${this.weight}`);
    }
}
