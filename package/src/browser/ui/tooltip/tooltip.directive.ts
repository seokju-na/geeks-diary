import { AriaDescriber, FocusMonitor } from '@angular/cdk/a11y';
import { ESCAPE } from '@angular/cdk/keycodes';
import {
    FlexibleConnectedPositionStrategy,
    HorizontalConnectionPos,
    OriginConnectionPosition,
    Overlay,
    OverlayConnectionPosition,
    OverlayRef,
    ScrollDispatcher,
    VerticalConnectionPos,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Directive, ElementRef, HostListener, Input, NgZone, OnDestroy, ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { TooltipComponent } from './tooltip.component';


const SCROLL_THROTTLE_MS = 25;


export type TooltipPosition = 'left' | 'right' | 'above' | 'below' | 'before' | 'after';


@Directive({
    selector: '[gdTooltip]',
})
export class TooltipDirective implements OnDestroy {
    _overlayRef: OverlayRef | null;
    _tooltipInstance: TooltipComponent | null;

    private _portal: ComponentPortal<TooltipComponent>;
    private _position: TooltipPosition = 'below';

    @Input()
    get position(): TooltipPosition {
        return this._position;
    }
    set position(value: TooltipPosition) {
        if (value !== this._position) {
            this._position = value;

            if (this._overlayRef) {
                this._updatePosition();

                if (this._tooltipInstance) {
                    this._tooltipInstance.show(0);
                }

                this._overlayRef.updatePosition();
            }
        }
    }

    /** The default delay in ms before showing the tooltip after show is called */
    @Input() showDelay = 500;

    /** The default delay in ms before hiding the tooltip after hide is called */
    @Input() hideDelay = 500;

    @Input()
    get message() {
        return this._message;
    }
    set message(value: string) {
        this._ariaDescriber.removeDescription(this._elementRef.nativeElement, this._message);

        // If the message is not a string (e.g. number), convert it to a string and trim it.
        this._message = value != null ? `${value}`.trim() : '';

        if (!this._message && this._isTooltipVisible()) {
            this.hide(0);
        } else {
            this._updateTooltipMessage();
            this._ariaDescriber.describe(this._elementRef.nativeElement, this.message);
        }
    }

    private _message = '';
    private _manualListeners = new Map<string, Function>();
    private readonly _destroyed = new Subject<void>();

    constructor(
        private _overlay: Overlay,
        private _elementRef: ElementRef,
        private _scrollDispatcher: ScrollDispatcher,
        private _viewContainerRef: ViewContainerRef,
        private _ngZone: NgZone,
        private _ariaDescriber: AriaDescriber,
        private _focusMonitor: FocusMonitor,
    ) {

        const element: HTMLElement = _elementRef.nativeElement;

        this._manualListeners.set('mouseenter', () => this.show());
        this._manualListeners.set('mouseleave', () => this.hide());

        this._manualListeners
            .forEach((listener, event) => _elementRef.nativeElement.addEventListener(event, listener));

        _focusMonitor.monitor(element).pipe(takeUntil(this._destroyed)).subscribe((origin) => {
            // Note that the focus monitor runs outside the Angular zone.
            if (!origin) {
                _ngZone.run(() => this.hide(0));
            } else if (origin === 'keyboard') {
                _ngZone.run(() => this.show());
            }
        });
    }

    ngOnDestroy(): void {
        if (this._overlayRef) {
            this._overlayRef.dispose();
            this._tooltipInstance = null;
        }

        this._manualListeners.forEach((listener, event) =>
            this._elementRef.nativeElement.removeEventListener(event, listener));

        this._manualListeners.clear();

        this._destroyed.next();
        this._destroyed.complete();

        this._ariaDescriber.removeDescription(this._elementRef.nativeElement, this.message);
        this._focusMonitor.stopMonitoring(this._elementRef.nativeElement);
    }

    /** Shows the tooltip after the delay in ms, defaults to tooltip-delay-show or 0ms if no input */
    show(delay: number = this.showDelay): void {
        if (!this.message) {
            return;
        }

        const overlayRef = this._createOverlay();

        this._detach();
        this._portal = this._portal || new ComponentPortal(TooltipComponent, this._viewContainerRef);
        this._tooltipInstance = overlayRef.attach(this._portal).instance;
        this._tooltipInstance
            .afterHidden()
            .pipe(takeUntil(this._destroyed))
            .subscribe(() => this._detach());

        this._updateTooltipMessage();

        this._tooltipInstance.show(delay);
    }

    /** Hides the tooltip after the delay in ms, defaults to tooltip-delay-hide or 0ms if no input */
    hide(delay: number = this.hideDelay): void {
        if (this._tooltipInstance) {
            this._tooltipInstance.hide(delay);
        }
    }

    toggle(): void {
        this._isTooltipVisible() ? this.hide() : this.show();
    }

    /** Returns true if the tooltip is currently visible to the user */
    _isTooltipVisible(): boolean {
        return !!this._tooltipInstance && this._tooltipInstance.isVisible();
    }

    /** Handles the keydown events on the host element. */
    @HostListener('keydown', ['$event'])
    private _handleKeyDown(e: KeyboardEvent): void {
        if (this._isTooltipVisible() && e.keyCode === ESCAPE) {
            e.stopPropagation();
            this.hide(0);
        }
    }

    /** Create the overlay config and position strategy */
    private _createOverlay(): OverlayRef {
        if (this._overlayRef) {
            return this._overlayRef;
        }

        // Create connected position strategy that listens for scroll events to reposition.
        const strategy = this._overlay.position()
            .flexibleConnectedTo(this._elementRef)
            .withTransformOriginOn('.Tooltip')
            .withFlexibleDimensions(false)
            .withViewportMargin(8);

        const scrollableAncestors = this._scrollDispatcher
            .getAncestorScrollContainers(this._elementRef);

        strategy.withScrollableContainers(scrollableAncestors);

        strategy.positionChanges.pipe(takeUntil(this._destroyed)).subscribe((change) => {
            if (this._tooltipInstance) {
                if (change.scrollableViewProperties.isOverlayClipped && this._tooltipInstance.isVisible()) {
                    // After position changes occur and the overlay is clipped by
                    // a parent scrollable then close the tooltip.
                    this._ngZone.run(() => this.hide(0));
                }
            }
        });

        this._overlayRef = this._overlay.create({
            positionStrategy: strategy,
            panelClass: 'TooltipPanel',
            scrollStrategy: this._overlay.scrollStrategies.reposition({
                scrollThrottle: SCROLL_THROTTLE_MS,
            }),
        });

        this._updatePosition();

        this._overlayRef.detachments()
            .pipe(takeUntil(this._destroyed))
            .subscribe(() => this._detach());

        return this._overlayRef;
    }

    /** Detaches the currently-attached tooltip. */
    private _detach(): void {
        if (this._overlayRef && this._overlayRef.hasAttached()) {
            this._overlayRef.detach();
        }

        this._tooltipInstance = null;
    }

    /** Updates the position of the current tooltip. */
    private _updatePosition(): void {
        const position =
            this._overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy;
        const origin = this._getOrigin();
        const overlay = this._getOverlayPosition();

        position.withPositions([
            { ...origin.main, ...overlay.main },
            { ...origin.fallback, ...overlay.fallback },
        ]);
    }

    /**
     * Returns the origin position and a fallback position based on the user's position preference.
     * The fallback position is the inverse of the origin (e.g. `'below' -> 'above'`).
     */
    _getOrigin(): { main: OriginConnectionPosition, fallback: OriginConnectionPosition } {
        const position = this.position;
        let originPosition: OriginConnectionPosition;

        /* tslint:disable */
        if (position == 'above' || position == 'below') {
            originPosition = { originX: 'center', originY: position == 'above' ? 'top' : 'bottom' };
        } else if (position == 'before' || position == 'left') {
            originPosition = { originX: 'start', originY: 'center' };
        } else if (position == 'after' || position == 'right') {
            originPosition = { originX: 'end', originY: 'center' };
        } else {
            throw new Error('Invalid tooltip position.');
        }
        /* tslint:enable */

        const { x, y } = this._invertPosition(originPosition.originX, originPosition.originY);

        return {
            main: originPosition,
            fallback: { originX: x, originY: y },
        };
    }

    /** Returns the overlay position and a fallback position based on the user's preference */
    _getOverlayPosition(): { main: OverlayConnectionPosition, fallback: OverlayConnectionPosition } {
        const position = this.position;
        let overlayPosition: OverlayConnectionPosition;

        /* tslint:disable */
        if (position == 'above') {
            overlayPosition = { overlayX: 'center', overlayY: 'bottom' };
        } else if (position == 'below') {
            overlayPosition = { overlayX: 'center', overlayY: 'top' };
        } else if (position == 'before' || position == 'left') {
            overlayPosition = { overlayX: 'end', overlayY: 'center' };
        } else if (position == 'after' || position == 'right') {
            overlayPosition = { overlayX: 'start', overlayY: 'center' };
        } else {
            throw new Error('Invalid tooltip position.');
        }
        /* tslint:disable */

        const { x, y } = this._invertPosition(overlayPosition.overlayX, overlayPosition.overlayY);

        return {
            main: overlayPosition,
            fallback: { overlayX: x, overlayY: y },
        };
    }

    /** Updates the tooltip message and repositions the overlay according to the new message length */
    private _updateTooltipMessage(): void {
        // Must wait for the message to be painted to the tooltip so that the overlay can properly
        // calculate the correct positioning based on the size of the text.
        if (this._tooltipInstance) {
            this._tooltipInstance.message = this.message;
            this._tooltipInstance._markForCheck();

            this._ngZone.onMicrotaskEmpty.asObservable().pipe(
                take(1),
                takeUntil(this._destroyed),
            ).subscribe(() => {
                if (this._tooltipInstance) {
                    this._overlayRef!.updatePosition();
                }
            });
        }
    }

    /** Inverts an overlay position. */
    private _invertPosition(x: HorizontalConnectionPos, y: VerticalConnectionPos) {
        if (this.position === 'above' || this.position === 'below') {
            if (y === 'top') {
                y = 'bottom';
            } else if (y === 'bottom') {
                y = 'top';
            }
        } else {
            if (x === 'end') {
                x = 'start';
            } else if (x === 'start') {
                x = 'end';
            }
        }

        return { x, y };
    }
}
