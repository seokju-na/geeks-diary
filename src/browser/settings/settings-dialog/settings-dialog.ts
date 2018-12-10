import { Injectable } from '@angular/core';
import { Dialog, DialogRef } from '../../ui/dialog';
import { SettingsDialogData } from './settings-dialog-data';
import { SettingsDialogComponent } from './settings-dialog.component';


@Injectable()
export class SettingsDialog {
    constructor(private dialog: Dialog) {
    }

    open(data?: SettingsDialogData): DialogRef<SettingsDialogComponent, void> {
        return this.dialog.open<SettingsDialogComponent,
            SettingsDialogData,
            void>(
            SettingsDialogComponent,
            {
                width: '500px',
                maxHeight: '75vh',
                disableBackdropClickClose: true,
                data,
            },
        );
    }
}
