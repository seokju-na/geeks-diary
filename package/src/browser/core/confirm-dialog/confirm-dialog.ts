import { Injectable } from '@angular/core';
import { Dialog } from '../../ui/dialog/dialog';
import { DialogRef } from '../../ui/dialog/dialog-ref';
import { ConfirmDialogData } from './confirm-dialog-data';
import { ConfirmDialogComponent } from './confirm-dialog.component';


@Injectable({
    providedIn: 'root',
})
export class ConfirmDialog {
    constructor(private dialog: Dialog) {
    }

    open(data: ConfirmDialogData): DialogRef<ConfirmDialogComponent> {
        return this.dialog
            .open<ConfirmDialogComponent,
            ConfirmDialogData,
            boolean>(ConfirmDialogComponent, { data });
    }

    openAlert(data: ConfirmDialogData): DialogRef<ConfirmDialogComponent> {
        const _data = {
            ...data,
            isAlert: true,
        };

        return this.open(_data);
    }
}
