import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { DIALOG_DATA } from '../../shared/dialog/dialog';


@Component({
    selector: 'gd-loading-dialog',
    templateUrl: './loading-dialog.component.html',
    styleUrls: ['./loading-dialog.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingDialogComponent {
    constructor(@Inject(DIALOG_DATA) public data: any) {
    }
}
