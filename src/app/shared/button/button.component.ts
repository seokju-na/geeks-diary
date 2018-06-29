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
    selector: 'button[gd-button]',
    templateUrl: './button.component.html',
    styleUrls: ['./button.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class ButtonComponent implements OnInit {
    @HostBinding('class.Button') private buttonClassName = true;
    @Input() buttonType = 'normal';
    @Input() size = 'regular';

    constructor(private elementRef: ElementRef) {
    }

    ngOnInit(): void {
        const host = this.elementRef.nativeElement;

        host.classList.add(`Button--type-${this.buttonType}`);
        host.classList.add(`Button--size-${this.size}`);
    }
}
