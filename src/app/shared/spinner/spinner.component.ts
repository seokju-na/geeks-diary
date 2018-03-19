import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostBinding,
    Input,
    ViewEncapsulation,
} from '@angular/core';


@Component({
    selector: 'gd-spinner',
    templateUrl: './spinner.component.html',
    styleUrls: ['./spinner.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class SpinnerComponent {
    @HostBinding('class.Spinner') private spinnerClassName = true;
    @HostBinding('attr.role') private ariaRole = 'progressbar';

    @Input()
    get show() { return this._show; }

    set show(value: boolean) {
        this._show = coerceBooleanProperty(value);

        const host = this.elementRef.nativeElement;

        if (this._show) {
            host.classList.add('Spinner--show');
        } else {
            host.classList.remove('Spinner--show');
        }
    }

    private _show = true;

    constructor(private elementRef: ElementRef) {
    }
}
