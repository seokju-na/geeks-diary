/**
 * Source from @angular/material2
 */
import { AriaDescriber, FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    ConnectedPositionStrategy,
    HorizontalConnectionPos,
    OriginConnectionPosition,
    Overlay,
    OverlayConnectionPosition,
    OverlayRef,
    VerticalConnectionPos,
} from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { ComponentPortal } from '@angular/cdk/portal';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import {
    Directive,
    ElementRef,
    HostListener,
    Input,
    NgZone,
    OnDestroy,
    ViewContainerRef,
} from '@angular/core';
import { filter, take, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { KeyCodes } from '../../../common/key-codes';
import { TooltipComponent } from './tooltip.component';


export type TooltipPosition = 'left' | 'right' | 'above' | 'below' | 'before' | 'after';


@Directive({
    selector: '[gdTooltip]',
})
export class TooltipDirective implements OnDestroy {
    _overlayRef: OverlayRef | null;
    _tooltipInstance: TooltipComponent | null;

    private portal: ComponentPortal<TooltipComponent>;
    private _position: TooltipPosition = 'below';
    private _disabled = false;

    private _message = '';
    private _manualListeners = new Map<string, Function>();
    private readonly _destroyed = new Subject<void>();

    @Input()
    get position(): TooltipPosition { return this._position; }

    set position(value: TooltipPosition) {
        if (value !== this._position) {
            this._position = value;

            if (this._overlayRef) {
                this.detach();
                this.updatePosition();
            }
        }
    }

    /** Disables the display of the tooltip. */
    @Input()
    get disabled(): boolean { return this._disabled; }

    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);

        // If tooltip is disabled, hide immediately.
        if (this._disabled) {
            this.hide(0);
        }
    }

    @Input()
    get message() { return this._message; }

    set message(value: string) {
        this.ariaDescriber.removeDescription(this.elementRef.nativeElement, this._message);

        // If the message is not a string (e.g. number), convert it to a string and trim it.
        this._message = value !== null ? `${value}`.trim() : '';

        if (!this._message && this.isTooltipVisible()) {
            this.hide(0);
        } else {
            this.updateTooltipMessage();
            this.ariaDescriber.describe(this.elementRef.nativeElement, this.message);
        }
    }

    @Input() showDelay = 0;
    @Input() hideDelay = 0;

    constructor(private overlay: Overlay,
                private elementRef: ElementRef,
                private scrollDispatcher: ScrollDispatcher,
                private viewContainerRef: ViewContainerRef,
                private ngZone: NgZone,
                private platform: Platform,
                private ariaDescriber: AriaDescriber,
                private focusMonitor: FocusMonitor) {

        const element: HTMLElement = elementRef.nativeElement;

        this._manualListeners.set('mouseenter', () => this.show());
        this._manualListeners.set('mouseleave', () => this.hide());

        this._manualListeners
            .forEach((listener, event) =>
                elementRef.nativeElement.addEventListener(event, listener));

        focusMonitor.monitor(element).pipe(takeUntil(this._destroyed)).subscribe((origin) => {
            // Note that the focus monitor runs outside the Angular zone.
            if (!origin) {
                ngZone.run(() => this.hide(0));
            } else if (origin !== 'program') {
                ngZone.run(() => this.show());
            }
        });
    }

    /**
     * Dispose the tooltip when destroyed.
     */
    ngOnDestroy() {
        if (this._overlayRef) {
            this._overlayRef.dispose();
            this._tooltipInstance = null;
        }

        this._manualListeners.forEach((listener, event) =>
            this.elementRef.nativeElement.removeEventListener(event, listener));

        this._manualListeners.clear();

        this._destroyed.next();
        this._destroyed.complete();

        this.ariaDescriber.removeDescription(this.elementRef.nativeElement, this.message);
        this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }

    show(delay: number = this.showDelay): void {
        if (this.disabled || !this.message) { return; }

        const overlayRef = this.createOverlay();

        this.detach();
        this.portal = this.portal || new ComponentPortal(TooltipComponent, this.viewContainerRef);
        this._tooltipInstance = overlayRef.attach(this.portal).instance;
        this._tooltipInstance.afterHidden()
            .pipe(takeUntil(this._destroyed))
            .subscribe(() => this.detach());
        this.updateTooltipMessage();
        this._tooltipInstance.show(this._position, delay);
    }

    hide(delay: number = this.hideDelay): void {
        if (this._tooltipInstance) {
            this._tooltipInstance.hide(delay);
        }
    }

    /** Shows/hides the tooltip */
    toggle(): void {
        this.isTooltipVisible() ? this.hide() : this.show();
    }

    /** Returns true if the tooltip is currently visible to the user */
    private isTooltipVisible(): boolean {
        return !!this._tooltipInstance && this._tooltipInstance.isVisible();
    }

    /** Handles the keydown events on the host element. */
    @HostListener('keydown', ['$event'])
    private handleKeydown(event: KeyboardEvent) {
        if (this.isTooltipVisible() && event.keyCode === KeyCodes.ESCAPE) {
            event.stopPropagation();
            this.hide(0);
        }
    }

    /** Create the overlay config and position strategy */
    private createOverlay(): OverlayRef {
        if (this._overlayRef) {
            return this._overlayRef;
        }

        const origin = this.getOrigin();
        const overlay = this.getOverlayPosition();

        // Create connected position strategy that listens for scroll events to reposition.
        const strategy = this.overlay
            .position()
            .connectedTo(this.elementRef, origin.main, overlay.main)
            .withFallbackPosition(origin.fallback, overlay.fallback);

        strategy.onPositionChange.pipe(
            filter(() => !!this._tooltipInstance),
            takeUntil(this._destroyed),
        ).subscribe(change => {
            if (change.scrollableViewProperties.isOverlayClipped
                && this._tooltipInstance.isVisible()) {
                // After position changes occur and the overlay is clipped by
                // a parent scrollable then close the tooltip.
                this.ngZone.run(() => this.hide(0));
            } else {
                // Otherwise recalculate the origin based on the new position.
                this._tooltipInstance._setTransformOrigin(change.connectionPair);
            }
        });

        this._overlayRef = this.overlay.create({
            positionStrategy: strategy,
        });

        this._overlayRef.detachments()
            .pipe(takeUntil(this._destroyed))
            .subscribe(() => this.detach());

        return this._overlayRef;
    }

    /** Detaches the currently-attached tooltip. */
    private detach() {
        if (this._overlayRef && this._overlayRef.hasAttached()) {
            this._overlayRef.detach();
        }

        this._tooltipInstance = null;
    }

    /** Updates the position of the current tooltip. */
    private updatePosition() {
        const position = this._overlayRef.getConfig().positionStrategy as ConnectedPositionStrategy;
        const origin = this.getOrigin();
        const overlay = this.getOverlayPosition();

        position
            .withPositions([])
            .withFallbackPosition(origin.main, overlay.main)
            .withFallbackPosition(origin.fallback, overlay.fallback);
    }

    /**
     * Returns the origin position and a fallback position based on the user's position preference.
     * The fallback position is the inverse of the origin (e.g. `'below' -> 'above'`).
     */
    private getOrigin(): { main: OriginConnectionPosition, fallback: OriginConnectionPosition } {
        let position: OriginConnectionPosition;

        if (this.position === 'above' || this.position === 'below') {
            position = { originX: 'center', originY: this.position === 'above' ? 'top' : 'bottom' };
        } else if (this.position === 'left' || this.position === 'before') {
            position = { originX: 'start', originY: 'center' };
        } else if (this.position === 'right' || this.position === 'after') {
            position = { originX: 'end', originY: 'center' };
        } else {
            throw new Error();
        }

        const { x, y } = this.invertPosition(position.originX, position.originY);

        return {
            main: position,
            fallback: { originX: x, originY: y },
        };
    }

    /** Returns the overlay position and a fallback position based on the user's preference */
    private getOverlayPosition(): {
        main: OverlayConnectionPosition,
        fallback: OverlayConnectionPosition,
    } {
        let position: OverlayConnectionPosition;

        if (this.position === 'above') {
            position = { overlayX: 'center', overlayY: 'bottom' };
        } else if (this.position === 'below') {
            position = { overlayX: 'center', overlayY: 'top' };
        } else if (this.position === 'left' || this.position === 'before') {
            position = { overlayX: 'end', overlayY: 'center' };
        } else if (this.position === 'right' || this.position === 'after') {
            position = { overlayX: 'start', overlayY: 'center' };
        } else {
            throw new Error();
        }

        const { x, y } = this.invertPosition(position.overlayX, position.overlayY);

        return {
            main: position,
            fallback: { overlayX: x, overlayY: y },
        };
    }

    private updateTooltipMessage() {
        // Must wait for the message to be painted to the tooltip so that the overlay can properly
        // calculate the correct positioning based on the size of the text.
        if (this._tooltipInstance) {
            this._tooltipInstance.message = this.message;
            this._tooltipInstance._markForCheck();

            this.ngZone.onMicrotaskEmpty.asObservable().pipe(
                take(1),
                takeUntil(this._destroyed),
            ).subscribe(() => {
                if (this._tooltipInstance) {
                    this._overlayRef.updatePosition();
                }
            });
        }
    }

    /** Inverts an overlay position. */
    private invertPosition(x: HorizontalConnectionPos, y: VerticalConnectionPos) {
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
