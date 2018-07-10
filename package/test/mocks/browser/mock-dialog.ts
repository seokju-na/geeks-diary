import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Dialog } from '../../../src/browser/ui/dialog/dialog';
import { DialogConfig } from '../../../src/browser/ui/dialog/dialog-config';
import { UIModule } from '../../../src/browser/ui/ui.module';
import { MockDialogRef } from './mock-dialog-ref';


@Injectable()
export class MockDialog extends Dialog {
    static importsForTesting = [
        NoopAnimationsModule,
        UIModule,
    ];

    static providersForTesting = [
        { provide: Dialog, useClass: MockDialog },
    ];

    openDialog: ComponentType<any>;
    openDialogConfig: Partial<DialogConfig<any>>;
    dialogRef: MockDialogRef;

    open(component: ComponentType<any>, config?: Partial<DialogConfig>): any {
        this.openDialog = component;
        this.openDialogConfig = config;
        this.dialogRef = new MockDialogRef();

        return this.dialogRef;
    }
}
