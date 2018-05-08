import { Injectable } from '@angular/core';
import { Dialog } from '../../shared/dialog/dialog';
import { DialogRef } from '../../shared/dialog/dialog-ref';
import { LoadingDialogComponent } from './loading-dialog.component';


@Injectable()
export class LoadingDialog {
    private dialogRef: DialogRef<LoadingDialogComponent, void> | null = null;

    constructor(private dialog: Dialog) {
    }

    open(title?: string): void {
        this.close();

        this.dialogRef = this.dialog.open(LoadingDialogComponent, {
            width: '350px',
            data: { title },
        });
    }

    close(): void {
        if (this.dialogRef) {
            this.dialogRef.close();
        }
    }
}
