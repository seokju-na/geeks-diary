import { ChangeDetectionStrategy, Component, HostBinding, ViewEncapsulation } from '@angular/core';


@Component({
    selector: 'gd-progress-bar',
    templateUrl: './progress-bar.component.html',
    styleUrls: ['./progress-bar.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class ProgressBarComponent {
    @HostBinding('style.appearance') private styleAppearance = 'none';
}
