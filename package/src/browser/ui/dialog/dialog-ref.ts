import { ESCAPE } from '@angular/cdk/keycodes';
import { OverlayRef } from '@angular/cdk/overlay';
import { Observable, Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { DialogContainerComponent } from './dialog-container.component';


let uniqueId = 0;


export class DialogRef<T, R = any> {
    componentInstance: T;
    disableClose: boolean | undefined = this._containerInstance._config.disableClose;

    private readonly _afterOpen = new Subject<void>();
    private readonly _afterClosed = new Subject<R | undefined>();
    private readonly _beforeClose = new Subject<R | undefined>();

    private _result: R | undefined;

    constructor(
        private _overlayRef: OverlayRef,
        public _containerInstance: DialogContainerComponent,
        readonly id: string = `gd-dialog-${uniqueId++}`,
    ) {

        _containerInstance._id = id;

        _containerInstance._animationStateChanged
            .pipe(
                filter(event => event.phaseName === 'done' && event.toState === 'enter'),
                take(1),
            )
            .subscribe(() => {
                this._afterOpen.next();
                this._afterOpen.complete();
            });

        // Dispose overlay when closing animation is complete
        _containerInstance._animationStateChanged.pipe(
            filter(event => event.phaseName === 'done' && event.toState === 'exit'),
            take(1),
        ).subscribe(() => this._overlayRef.dispose());

        _overlayRef.detachments().subscribe(() => {
            this._beforeClose.next(this._result);
            this._beforeClose.complete();
            this._afterClosed.next(this._result);
            this._afterClosed.complete();
            this.componentInstance = null;
            this._overlayRef.dispose();
        });

        _overlayRef.keydownEvents()
            .pipe(filter(event => event.keyCode === ESCAPE && !this.disableClose))
            .subscribe(() => this.close());
    }

    close(dialogResult?: R): void {
        this._result = dialogResult;

        // Transition the backdrop in parallel to the dialog.
        this._containerInstance._animationStateChanged
            .pipe(
                filter(event => event.phaseName === 'start'),
                take(1),
            )
            .subscribe(() => {
                this._beforeClose.next(dialogResult);
                this._beforeClose.complete();
                this._overlayRef.detachBackdrop();
            });

        this._containerInstance._startExitAnimation();
    }

    afterOpen(): Observable<void> {
        return this._afterOpen.asObservable();
    }

    afterClosed(): Observable<R | undefined> {
        return this._afterClosed.asObservable();
    }

    beforeClose(): Observable<R | undefined> {
        return this._beforeClose.asObservable();
    }
}
