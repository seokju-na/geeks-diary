import { Injectable } from '@angular/core';
import { Dialog, DialogRef } from '../../ui/dialog';
import { ConfirmDialogData } from './confirm-dialog-data';
import { ConfirmDialogComponent } from './confirm-dialog.component';


@Injectable()
export class ConfirmDialog {
    constructor(private dialog: Dialog) {
    }

    open(data: ConfirmDialogData): DialogRef<ConfirmDialogComponent, boolean> {
        return this.dialog.open<ConfirmDialogComponent,
            ConfirmDialogData,
            boolean>(
            ConfirmDialogComponent,
            {
                maxWidth: '320px',
                data: { ...new ConfirmDialogData(), ...data },
            },
        );
    }
}
