/**
 * Source from @angular/material2
 */
import { animate, AnimationEvent, state, style, transition, trigger } from '@angular/animations';
import { ConnectionPositionPair } from '@angular/cdk/overlay';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    ViewEncapsulation,
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { TooltipPosition } from './tooltip.directive';


export type TooltipVisibility = 'initial' | 'visible' | 'hidden';


@Component({
    selector: 'gd-tooltip',
    templateUrl: './tooltip.component.html',
    styleUrls: ['./tooltip.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    animations: [
        trigger('state', [
            state('initial, void, hidden', style({ visibility: 'hidden' })),
            state('visible', style({ visibility: 'visible' })),
            transition('* => visible',
                animate('150ms cubic-bezier(0.0, 0.0, 0.2, 1)')),
            transition('* => hidden',
                animate('150ms cubic-bezier(0.4, 0.0, 1, 1)')),
        ]),
    ],
})
export class TooltipComponent {
    message: string;
    visibility: TooltipVisibility = 'initial';

    private showTimeoutId: number;
    private hideTimeoutId: number;

    /** Whether interactions on the page should close the tooltip */
    private closeOnInteraction = false;

    /** The transform origin used in the animation for showing and hiding the tooltip */
    transformOrigin: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

    /** Current position of the tooltip. */
    private position: TooltipPosition;

    /** Subject for notifying that the tooltip has been hidden from the view */
    private readonly onHide = new Subject<any>();

    constructor(private changeDetectorRef: ChangeDetectorRef) {
    }

    /**
     * Shows the tooltip with an animation originating from the provided origin
     * @param position Position of the tooltip.
     * @param delay Amount of milliseconds to the delay showing the tooltip.
     */
    show(position: TooltipPosition, delay: number): void {
        // Cancel the delayed hide if it is scheduled
        if (this.hideTimeoutId) {
            clearTimeout(this.hideTimeoutId);
        }

        // Body interactions should cancel the tooltip if there is a delay in showing.
        this.closeOnInteraction = true;
        this.position = position;
        this.showTimeoutId = window.setTimeout(() => {
            this.visibility = 'visible';

            // Mark for check so if any parent component has set the
            // ChangeDetectionStrategy to OnPush it will be checked anyways
            this._markForCheck();
        }, delay);
    }

    /**
     * Begins the animation to hide the tooltip after the provided delay in ms.
     * @param delay Amount of milliseconds to delay showing the tooltip.
     */
    hide(delay: number): void {
        // Cancel the delayed show if it is scheduled
        if (this.showTimeoutId) {
            clearTimeout(this.showTimeoutId);
        }

        this.hideTimeoutId = window.setTimeout(() => {
            this.visibility = 'hidden';

            // Mark for check so if any parent component has set the
            // ChangeDetectionStrategy to OnPush it will be checked anyways
            this._markForCheck();
        }, delay);
    }

    /** Returns an observable that notifies when the tooltip has been hidden from view. */
    afterHidden(): Observable<void> {
        return this.onHide.asObservable();
    }

    /** Whether the tooltip is being displayed. */
    isVisible(): boolean {
        return this.visibility === 'visible';
    }

    /** Sets the tooltip transform origin according to the position of the tooltip overlay. */
    _setTransformOrigin(overlayPosition: ConnectionPositionPair) {
        const axis = (this.position === 'above' || this.position === 'below') ? 'Y' : 'X';
        const position = axis === 'X' ? overlayPosition.overlayX : overlayPosition.overlayY;

        if (position === 'top' || position === 'bottom') {
            this.transformOrigin = position;
        } else if (position === 'start') {
            this.transformOrigin = 'left';
        } else if (position === 'end') {
            this.transformOrigin = 'right';
        } else {
            throw new Error();
        }
    }

    animationStart() {
        this.closeOnInteraction = false;
    }

    animationDone(event: AnimationEvent): void {
        const toState = event.toState as TooltipVisibility;

        if (toState === 'hidden' && !this.isVisible()) {
            this.onHide.next();
        }

        if (toState === 'visible' || toState === 'hidden') {
            this.closeOnInteraction = true;
        }
    }

    /**
     * Interactions on the HTML body should close the tooltip immediately as defined in the
     * material design spec.
     * https://material.google.com/components/tooltips.html#tooltips-interaction
     */
    @HostListener('body:click')
    private handleBodyInteraction(): void {
        if (this.closeOnInteraction) {
            this.hide(0);
        }
    }

    /**
     * Marks that the tooltip needs to be checked in the next change detection run.
     * Mainly used for rendering the initial text before positioning a tooltip, which
     * can be problematic in components with OnPush change detection.
     */
    _markForCheck(): void {
        this.changeDetectorRef.markForCheck();
    }
}
