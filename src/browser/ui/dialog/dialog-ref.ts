import { ESCAPE } from '@angular/cdk/keycodes';
import { GlobalPositionStrategy, OverlayRef, OverlaySizeConfig } from '@angular/cdk/overlay';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { DialogPosition } from './dialog-config';
import { DialogContainerComponent } from './dialog-container.component';


let uniqueId = 0;


/**
 * Reference to a dialog opened via the Dialog service.
 */
export class DialogRef<T, R = any> {
    componentInstance: T;

    disableBackdropClickClose: boolean | undefined =
        this._containerInstance.config.disableBackdropClickClose;

    disableEscapeKeyDownClose: boolean | undefined =
        this._containerInstance.config.disableEscapeKeyDownClose;

    private _result: R | undefined;

    constructor(
        public _overlayRef: OverlayRef,
        public _containerInstance: DialogContainerComponent,
        readonly id: string = `gd-dialog-${uniqueId++}`,
    ) {

        if (this._containerInstance.config.hasBackdrop) {
            _overlayRef.backdropClick().subscribe(() => {
                if (!this.disableBackdropClickClose) {
                    this.close();
                }
            });
        }

        this.beforeClosed().subscribe(() => {
            this._overlayRef.detachBackdrop();
        });

        this.afterClosed().subscribe(() => {
            this._overlayRef.detach();
            this._overlayRef.dispose();
            this.componentInstance = null;
        });

        _overlayRef.keydownEvents()
            .pipe(filter(event => event.keyCode === ESCAPE && !this.disableEscapeKeyDownClose))
            .subscribe(() => this.close());
    }

    close(dialogResult?: R): void {
        this._result = dialogResult;
        this._containerInstance._startExiting();
    }

    beforeOpened(): Observable<void> {
        return this._containerInstance._beforeEnter.asObservable();
    }

    afterOpened(): Observable<void> {
        return this._containerInstance._afterEnter.asObservable();
    }

    beforeClosed(): Observable<R | undefined> {
        return this._containerInstance._beforeExit.pipe(map(() => this._result));
    }

    afterClosed(): Observable<R | undefined> {
        return this._containerInstance._afterExit.pipe(map(() => this._result));
    }

    updatePosition(position?: DialogPosition): this {
        const strategy = this.getPositionStrategy();

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

        this._overlayRef.updatePosition();

        return this;
    }

    updateSize(size: OverlaySizeConfig): this {
        if (size.width) {
            this.getPositionStrategy().width(size.width.toString());
        }

        if (size.height) {
            this.getPositionStrategy().height(size.height.toString());
        }

        this._overlayRef.updateSize(size);
        this._overlayRef.updatePosition();

        return this;
    }

    private getPositionStrategy(): GlobalPositionStrategy {
        return this._overlayRef.getConfig().positionStrategy as GlobalPositionStrategy;
    }
}
