import { AnimationEvent } from '@angular/animations';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostBinding, HostListener,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { tooltipAnimations } from './tooltip-animations';


export type TooltipVisibility = 'initial' | 'visible' | 'hidden';


@Component({
    selector: 'gd-tooltip',
    templateUrl: './tooltip.component.html',
    styleUrls: ['./tooltip.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [tooltipAnimations.tooltipState],
})
export class TooltipComponent implements OnInit {
    @HostBinding('attr.aria-hidden') private ariaHidden = true;

    /** Message to display in the tooltip */
    message: string;

    /** The timeout ID of any current timer set to show the tooltip */
    _showTimeoutId: number;

    /** The timeout ID of any current timer set to hide the tooltip */
    _hideTimeoutId: number;

    /** Property watched by the animation framework to show or hide the tooltip */
    _visibility: TooltipVisibility = 'initial';

    /** Whether interactions on the page should close the tooltip */
    private _closeOnInteraction: boolean = false;

    /** Subject for notifying that the tooltip has been hidden from the view */
    private readonly _onHide: Subject<any> = new Subject<any>();

    constructor(private changeDetectorRef: ChangeDetectorRef) {
    }

    ngOnInit(): void {
    }

    show(delay: number): void {
        // Cancel the delayed hide if it is scheduled
        if (this._hideTimeoutId) {
            clearTimeout(this._hideTimeoutId);
        }

        // Body interactions should cancel the tooltip if there is a delay in showing.
        this._closeOnInteraction = true;
        this._showTimeoutId = window.setTimeout(() => {
            this._visibility = 'visible';

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
        if (this._showTimeoutId) {
            clearTimeout(this._showTimeoutId);
        }

        this._hideTimeoutId = window.setTimeout(() => {
            this._visibility = 'hidden';

            // Mark for check so if any parent component has set the
            // ChangeDetectionStrategy to OnPush it will be checked anyways
            this._markForCheck();
        }, delay);
    }

    /** Returns an observable that notifies when the tooltip has been hidden from view. */
    afterHidden(): Observable<void> {
        return this._onHide.asObservable();
    }

    /** Whether the tooltip is being displayed. */
    isVisible(): boolean {
        return this._visibility === 'visible';
    }

    _animationStart() {
        this._closeOnInteraction = false;
    }

    _animationDone(event: AnimationEvent): void {
        const toState = event.toState as TooltipVisibility;

        if (toState === 'hidden' && !this.isVisible()) {
            this._onHide.next();
        }

        if (toState === 'visible' || toState === 'hidden') {
            this._closeOnInteraction = true;
        }
    }

    /**
     * Interactions on the HTML body should close the tooltip immediately as defined in the
     * material design spec.
     * https://material.google.com/components/tooltips.html#tooltips-interaction
     */
    @HostListener('body:click')
    private handleBodyInteraction(): void {
        if (this._closeOnInteraction) {
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
