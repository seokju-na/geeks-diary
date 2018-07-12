import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';


@Component({
    selector: 'gd-spinner',
    templateUrl: './spinner.component.html',
    styleUrls: ['./spinner.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        'class': 'Spinner',
        '[class.Spinner--show]': 'show',
    },
})
export class SpinnerComponent {
    @Input()
    get show() {
        return this._show;
    }
    set show(value) {
        this._show = coerceBooleanProperty(value);
    }

    private _show: boolean = false;

    constructor() {
    }

}
