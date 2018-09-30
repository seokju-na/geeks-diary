import { ComponentType } from '@angular/cdk/portal';
import { Provider } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, Subject } from 'rxjs';
import { Dialog, DialogConfig, DialogModule } from '../../../src/browser/ui/dialog';


export class MockDialogRef<T, D = any, R = any> {
    readonly _beforeOpened = new Subject<void>();
    readonly _afterOpened = new Subject<void>();
    readonly _afterClosed = new Subject<any>();
    readonly _beforeClosed = new Subject<any>();

    constructor(
        private dialog: MockDialog,
        public component: ComponentType<T>,
        public config?: DialogConfig<D>,
    ) {
    }

    beforeOpened(): Observable<void> {
        return this._beforeOpened.asObservable();
    }

    afterOpened(): Observable<void> {
        return this._afterOpened.asObservable();
    }

    beforeClosed(): Observable<R | undefined> {
        return this._beforeClosed.asObservable();
    }

    afterClosed(): Observable<R | undefined> {
        return this._afterClosed.asObservable();
    }

    close(result?: R): void {
        this._beforeClosed.next(result);
        this._afterClosed.next(result);

        this.dialog._closeDialog(this);
    }
}


export class MockDialog {
    openDialogs: MockDialogRef<any>[] = [];

    static imports(): any[] {
        return [DialogModule, NoopAnimationsModule];
    }

    static providers(): Provider[] {
        return [{ provide: Dialog, useClass: MockDialog }];
    }

    open<T, D, R>(component: ComponentType<T>, config?: DialogConfig<D>): MockDialogRef<T, D, R> {
        const dialogRef = new MockDialogRef(this, component, config);

        this.openDialogs.push(dialogRef);

        dialogRef._beforeOpened.next();
        dialogRef._afterOpened.next();

        return dialogRef;
    }

    closeAll(): void {
        this.openDialogs.forEach((dialogRef) => {
            this._closeDialog(dialogRef);
        });
    }

    getByComponent<T, D = any, R = any>(component: ComponentType<T>): MockDialogRef<T, D, R> {
        return this.openDialogs.find(dialogRef => dialogRef.component === component);
    }

    _closeDialog(dialogRef: MockDialogRef<any>): void {
        const index = this.openDialogs.indexOf(dialogRef);

        if (index !== -1) {
            this.openDialogs.splice(index, 1);
        }
    }
}
