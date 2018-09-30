import { Component, Inject, OnInit, Optional } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '../../ui/dialog';
import { ConfirmDialogData } from './confirm-dialog-data';


@Component({
    selector: 'gd-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent implements OnInit {

    constructor(
        @Optional() @Inject(DIALOG_DATA) public data: ConfirmDialogData,
        private dialogRef: DialogRef<ConfirmDialogComponent, boolean>,
    ) {
    }

    ngOnInit() {
    }

}
