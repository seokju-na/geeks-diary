import { Injectable } from '@angular/core';
import { Dialog, DialogRef } from '../../ui/dialog';
import { ChangeFileNameDialogData } from './change-file-name-dialog-data';
import { ChangeFileNameDialogResult } from './change-file-name-dialog-result';
import { ChangeFileNameDialogComponent } from './change-file-name-dialog.component';


/**
 * Service for change file name dialog which available at the top level of dialog service.
 */
@Injectable()
export class ChangeFileNameDialog {
    constructor(private dialog: Dialog) {
    }

    /**
     * Open change file name dialog.
     * @param data
     */
    open(data: ChangeFileNameDialogData): DialogRef<ChangeFileNameDialogComponent,
        ChangeFileNameDialogResult> {

        return this.dialog.open<ChangeFileNameDialogComponent,
            ChangeFileNameDialogData,
            ChangeFileNameDialogResult>(
            ChangeFileNameDialogComponent,
            {
                disableBackdropClickClose: true,
                disableEscapeKeyDownClose: true,
                data,
            },
        );
    }
}
