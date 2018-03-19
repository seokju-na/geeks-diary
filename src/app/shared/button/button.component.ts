import { coerceBooleanProperty } from '@angular/cdk/coercion';
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

    @Input()
    get showSpinner() { return this._showSpinner; }

    set showSpinner(value: boolean) {
        this._showSpinner = coerceBooleanProperty(value);

        const host = this.elementRef.nativeElement;

        if (this._showSpinner) {
            host.classList.add('Button--showSpinner');
        } else {
            host.classList.remove('Button--showSpinner');
        }
    }

    @Input() buttonType = 'normal';
    @Input() size = 'regular';

    private _showSpinner = false;

    constructor(private elementRef: ElementRef) {
    }

    ngOnInit(): void {
        const host = this.elementRef.nativeElement;

        host.classList.add(`Button--type-${this.buttonType}`);
        host.classList.add(`Button--size-${this.size}`);
    }
}
