import { AnimationEvent } from '@angular/animations';
import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';
import { BasePortalOutlet, CdkPortalOutlet, ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    ComponentRef,
    ElementRef,
    EmbeddedViewRef,
    EventEmitter,
    Inject,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { dialogAnimations } from './dialog-animations';
import { DialogConfig, DialogRole } from './dialog-config';


@Component({
    selector: 'gd-dialog-container',
    templateUrl: './dialog-container.component.html',
    styleUrls: ['./dialog-container.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: [dialogAnimations.slideDialog],
})
export class DialogContainerComponent extends BasePortalOutlet {
    @ViewChild(CdkPortalOutlet) _portalOutlet: CdkPortalOutlet;

    private _focusTrap: FocusTrap;
    private _elementFocusedBeforeDialogWasOpened: HTMLElement | null = null;

    _id: string;
    _state: 'void' | 'enter' | 'exit' = 'enter';
    _animationStateChanged = new EventEmitter<AnimationEvent>();
    _ariaLabelledBy: string | null = null;
    _role: DialogRole;

    constructor(
        private _elementRef: ElementRef,
        private _focusTrapFactory: FocusTrapFactory,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(DOCUMENT) private _document: any,
        readonly _config: DialogConfig,
    ) {

        super();

        this._role = _config.role;
    }

    attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
        if (this._portalOutlet.hasAttached()) {
            throw new Error('Dialog content already attached!');
        }

        this.savePreviouslyFocusedElement();
        return this._portalOutlet.attachComponentPortal(portal);
    }

    attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
        throw new Error('Template portal is not supported.');
    }

    private trapFocus() {
        if (!this._focusTrap) {
            this._focusTrap = this._focusTrapFactory.create(this._elementRef.nativeElement);
        }

        // If were to attempt to focus immediately, then the content of the dialog would not yet be
        // ready in instances where change detection has to run first. To deal with this, we simply
        // wait for the microtask queue to be empty.
        if (this._config.autoFocus) {
            this._focusTrap.focusInitialElementWhenReady();
        }
    }

    /** Restores focus to the element that was focused before the dialog opened. */
    private restoreFocus() {
        const toFocus = this._elementFocusedBeforeDialogWasOpened;

        // We need the extra check, because IE can set the `activeElement` to null in some cases.
        if (toFocus && typeof toFocus.focus === 'function') {
            toFocus.focus();
        }

        if (this._focusTrap) {
            this._focusTrap.destroy();
        }
    }

    /** Saves a reference to the element that was focused before the dialog was opened. */
    private savePreviouslyFocusedElement() {
        this._elementFocusedBeforeDialogWasOpened = this._document.activeElement as HTMLElement;

        // Note that there is no focus method when rendering on the server.
        if (this._elementRef.nativeElement.focus) {
            // Move focus onto the dialog immediately in order to prevent the user from accidentally
            // opening multiple dialogs at the same time. Needs to be async, because the element
            // may not be focusable immediately.
            Promise.resolve().then(() => this._elementRef.nativeElement.focus());
        }
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
        this._changeDetectorRef.markForCheck();
    }
}
