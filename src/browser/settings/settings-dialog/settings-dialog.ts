import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Dialog, DialogRef } from '../../ui/dialog';
import { SettingsDialogData } from './settings-dialog-data';
import { SettingsDialogComponent } from './settings-dialog.component';


@Injectable()
export class SettingsDialog implements OnDestroy {
    private dialogRef: DialogRef<SettingsDialogComponent, void> | null = null;
    private dialogCloseSubscription = Subscription.EMPTY;

    constructor(private dialog: Dialog) {
    }

    ngOnDestroy(): void {
        this.dialogCloseSubscription.unsubscribe();
    }

    open(data?: SettingsDialogData): DialogRef<SettingsDialogComponent, void> {
        if (this.dialogRef) {
            return this.dialogRef;
        }

        this.dialogRef = this.dialog.open<SettingsDialogComponent,
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

        // If subscription exists, unsubscribe first.
        if (this.dialogCloseSubscription) {
            this.dialogCloseSubscription.unsubscribe();
        }

        this.dialogCloseSubscription = this.dialogRef.afterClosed().subscribe(() => {
            this.dialogRef = null;
        });

        return this.dialogRef;
    }
}
