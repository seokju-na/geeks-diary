import { AnimationEvent } from '@angular/animations';
import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';
import {
    BasePortalOutlet,
    CdkPortalOutlet,
    ComponentPortal,
    TemplatePortal,
} from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    ComponentRef,
    ElementRef,
    EmbeddedViewRef,
    EventEmitter,
    Inject,
    Optional,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { dialogAnimations } from './dialog-animations';
import { DialogConfig } from './dialog-config';


@Component({
    selector: 'gd-dialog-container',
    templateUrl: './dialog-container.component.html',
    styleUrls: ['./dialog-container.component.less'],
    encapsulation: ViewEncapsulation.None,
    animations: [dialogAnimations.slideDialog],
})
export class DialogContainerComponent extends BasePortalOutlet {
    @ViewChild(CdkPortalOutlet) portalOutlet: CdkPortalOutlet;

    _id: string;
    _config: DialogConfig;
    _state: 'void' | 'enter' | 'exit' = 'enter';
    _animationStateChanged = new EventEmitter<AnimationEvent>();

    private focusTrap: FocusTrap;
    private elementFocusedBeforeDialogWasOpened: HTMLElement | null = null;

    constructor(
        private elementRef: ElementRef,
        private focusTrapFactory: FocusTrapFactory,
        private changeDetectorRef: ChangeDetectorRef,
        @Optional() @Inject(DOCUMENT) private document: any,
    ) {

        super();
    }

    attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
        if (this.portalOutlet.hasAttached()) {
            throw new Error('Outlet already attached!');
        }

        this.savePreviouslyFocusedElement();

        return this.portalOutlet.attachComponentPortal(portal);
    }

    attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
        throw new Error('this will be not used.');
    }

    _onAnimationDone(event: AnimationEvent) {
        if (event.toState === 'enter') {
            this.trapFocus();
        } else if (event.toState === 'exit') {
            this.restoreFocus();
        }

        this._animationStateChanged.emit(event);
    }

    /** Callback, invoked when an animation on the host starts. */
    _onAnimationStart(event: AnimationEvent) {
        this._animationStateChanged.emit(event);
    }

    /** Starts the dialog exit animation. */
    _startExitAnimation(): void {
        this._state = 'exit';

        // Mark the container for check so it can react if the
        // view container is using OnPush change detection.
        this.changeDetectorRef.markForCheck();
    }

    private savePreviouslyFocusedElement() {
        if (this.document) {
            this.elementFocusedBeforeDialogWasOpened = this.document.activeElement as HTMLElement;

            // Note that there is no focus method when rendering on the server.
            if (this.elementRef.nativeElement.focus) {
                // Move focus onto the dialog immediately in order to prevent the user from
                // accidentally opening multiple dialogs at the same time. Needs to be async,
                // because the element may not be focusable immediately.
                Promise.resolve().then(() => this.elementRef.nativeElement.focus());
            }
        }
    }

    private trapFocus() {
        if (!this.focusTrap) {
            this.focusTrap = this.focusTrapFactory.create(this.elementRef.nativeElement);
        }

        // If were to attempt to focus immediately, then the content of the dialog would not yet be
        // ready in instances where change detection has to run first. To deal with this, we simply
        // wait for the microtask queue to be empty.
        if (this._config.autoFocus) {
            this.focusTrap.focusInitialElementWhenReady();
        }
    }

    /** Restores focus to the element that was focused before the dialog opened. */
    private restoreFocus() {
        const toFocus = this.elementFocusedBeforeDialogWasOpened;

        // We need the extra check, because IE can set the `activeElement` to null in some cases.
        if (toFocus && typeof toFocus.focus === 'function') {
            toFocus.focus();
        }

        if (this.focusTrap) {
            this.focusTrap.destroy();
        }
    }
}
