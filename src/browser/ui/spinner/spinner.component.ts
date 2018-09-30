import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';


@Component({
    selector: 'gd-spinner',
    templateUrl: './spinner.component.html',
    styleUrls: ['./spinner.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'class': 'Spinner',
        '[class.Spinner--contrast]': 'contrast',
    },
})
export class SpinnerComponent {
    @Input() contrast = false;
}
