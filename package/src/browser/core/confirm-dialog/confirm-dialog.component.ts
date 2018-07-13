import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DIALOG_DATA } from '../../ui/dialog/dialog';
import { DialogRef } from '../../ui/dialog/dialog-ref';
import { ConfirmDialogData } from './confirm-dialog-data';


@Component({
    selector: 'gd-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
    host: {
        'class': 'ConfirmDialog',
    },
})
export class ConfirmDialogComponent implements OnInit {
    contentHtml: SafeHtml;

    constructor(
        @Inject(DIALOG_DATA) public data: ConfirmDialogData,
        private dialogRef: DialogRef<ConfirmDialogComponent>,
        private sanitizer: DomSanitizer,
    ) {
    }

    get alertButtonString(): string {
        return this.data.alertButtonString || 'Close';
    }

    get cancelButtonString(): string {
        return this.data.cancelButtonString || 'Cancel';
    }

    get confirmButtonString(): string {
        return this.data.confirmButtonString || 'OK';
    }

    ngOnInit(): void {
        this.contentHtml = this.sanitizer.bypassSecurityTrustHtml(this.data.content);
    }

    confirm(): void {
        this.dialogRef.close(true);
    }
}
