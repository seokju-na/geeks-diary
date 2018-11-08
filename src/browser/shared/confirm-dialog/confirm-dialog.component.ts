import { Component, Inject, Optional } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DIALOG_DATA, DialogRef } from '../../ui/dialog';
import { ConfirmDialogData } from './confirm-dialog-data';


@Component({
    selector: 'gd-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent {

    constructor(
        @Optional() @Inject(DIALOG_DATA) public data: ConfirmDialogData,
        private dialogRef: DialogRef<ConfirmDialogComponent, boolean>,
        private sanitizer: DomSanitizer,
    ) {
    }

    get content(): SafeHtml {
        if (this.data && this.data.body) {
            return this.sanitizer.bypassSecurityTrustHtml(this.data.body.replace('\n', '<br>'));
        } else {
            return '';
        }
    }

    closeWith(result?: boolean): void {
        this.dialogRef.close(result);
    }
}
