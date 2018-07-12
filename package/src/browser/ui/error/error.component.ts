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
    selector: 'gd-error',
    templateUrl: './error.component.html',
    styleUrls: ['./error.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class ErrorComponent {
    @Input() errorName: string;
    @Input()
    get show() {
        return this._show;
    }
    set show(value: any) {
        const hostEl: HTMLElement = this._elementRef.nativeElement;

        this._show = coerceBooleanProperty(value);

        if (this._show && !hostEl.classList.contains('Error--show')) {
            hostEl.classList.add('Error--show');
        } else if (!this._show) {
            hostEl.classList.remove('Error--show');
        }
    }

    @HostBinding('class.Error') private className = true;

    private _show: boolean = false;

    constructor(public _elementRef: ElementRef) {
    }
}
