import { GlobalPositionStrategy, OverlayRef } from '@angular/cdk/overlay';
import { Observable, Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { KeyCodes } from '../../../common/key-codes';
import { DialogPosition } from './dialog-config';
import { DialogContainerComponent } from './dialog-container.component';


let uniqueId = 0;


export class DialogRef<T, R = any> {
    componentInstance: T;
    readonly id: string = `Dialog-${uniqueId++}`;

    private readonly _afterOpen = new Subject<void>();
    private readonly _afterClosed = new Subject<R | undefined>();
    private readonly _beforeClose = new Subject<R | undefined>();
    private result: R | undefined;

    constructor(private overlayRef: OverlayRef,
                public _containerInstance: DialogContainerComponent) {

        this._containerInstance._id = this.id;
        this._containerInstance._animationStateChanged
            .pipe(
                filter(event => event.phaseName === 'done' && event.toState === 'enter'),
                take(1),
            )
            .subscribe(() => {
                this._afterOpen.next();
                this._afterOpen.complete();
            });

        this._containerInstance._animationStateChanged
            .pipe(
                filter(event => event.phaseName === 'done' && event.toState === 'exit'),
                take(1),
            )
            .subscribe(() => {
                this.overlayRef.dispose();
                this._afterClosed.next(this.result);
                this._afterClosed.complete();
                this.componentInstance = null;
            });

        this.overlayRef
            .keydownEvents()
            .pipe(filter(event => event.keyCode === KeyCodes.ESCAPE
                && this._containerInstance._config.closeOnEscape))
            .subscribe(() => this.close());
    }

    close(dialogResult?: R): void {
        this.result = dialogResult;

        this._containerInstance._animationStateChanged
            .pipe(
                filter(event => event.phaseName === 'start'),
                take(1),
            )
            .subscribe(() => {
                this._beforeClose.next(dialogResult);
                this._beforeClose.complete();
                this.overlayRef.detachBackdrop();
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

    keydownEvents(): Observable<KeyboardEvent> {
        return this.overlayRef.keydownEvents();
    }

    updatePosition(position?: DialogPosition): this {
        const strategy = this.overlayRef.getConfig().positionStrategy as GlobalPositionStrategy;

        if (position && (position.left || position.right)) {
            position.left ? strategy.left(position.left) : strategy.right(position.right);
        } else {
            strategy.centerHorizontally();
        }

        if (position && (position.top || position.bottom)) {
            position.top ? strategy.top(position.top) : strategy.bottom(position.bottom);
        } else {
            strategy.centerVertically();
        }

        this.overlayRef.updatePosition();

        return this;
    }

    updateSize(width: string = 'auto', height: string = 'auto'): this {
        const strategy = this.overlayRef.getConfig().positionStrategy as GlobalPositionStrategy;

        strategy.width(width).height(height);
        this.overlayRef.updatePosition();

        return this;
    }
}
