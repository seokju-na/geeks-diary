import { animate, AnimationEvent, state, style, transition, trigger } from '@angular/animations';
import { FocusTrapFactory } from '@angular/cdk/a11y';
import {
    BasePortalOutlet,
    ComponentPortal,
    PortalHostDirective,
    TemplatePortal,
} from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    ComponentRef,
    ElementRef,
    EmbeddedViewRef, HostListener,
    Inject,
    OnDestroy,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { Subject } from 'rxjs';
import { DialogConfig } from './dialog-config';


@Component({
    selector: 'gd-dialog-container',
    templateUrl: './dialog-container.component.html',
    styleUrls: ['./dialog-container.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: [
        trigger('dialog', [
            state('enter', style({ opacity: 1 })),
            state('exit, void', style({ opacity: 0 })),
            transition('* => *', animate(255)),
        ]),
    ],
    host: {
        '[attr.tabindex]': '-1',
        '[@dialog]': '_state',
        '[attr.role]': 'config.role',
        '[attr.aria-labelledby]': '_ariaLabelledBy || null',
    },
})
export class DialogContainerComponent extends BasePortalOutlet implements OnDestroy {
    @ViewChild(PortalHostDirective) _portalHost: PortalHostDirective;

    _beforeEnter = new Subject<void>();
    _afterEnter = new Subject<void>();
    _beforeExit = new Subject<void>();
    _afterExit = new Subject<void>();

    /** State of the dialog animation. */
    _state: 'void' | 'enter' | 'exit' = 'enter';
    _ariaLabelledBy: string;

    private _focusTrap = this.focusTrapFactory.create(this.elementRef.nativeElement);
    private _elementFocusedBeforeDialogWasOpened: HTMLElement | null = null;

    constructor(
        private elementRef: ElementRef<HTMLElement>,
        private focusTrapFactory: FocusTrapFactory,
        private changeDetectorRef: ChangeDetectorRef,
        @Inject(DOCUMENT) private document: any,
        public config: DialogConfig,
    ) {

        super();
    }

    ngOnDestroy(): void {
        this._focusTrap.destroy();
    }

    attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
        if (this._portalHost.hasAttached()) {
            throw new Error('Already dialog content attached!');
        }

        this.savePreviouslyFocusedElement();

        return this._portalHost.attachComponentPortal(portal);
    }

    attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
        throw new Error('We do not use template portal.');
    }

    _startExiting(): void {
        this._state = 'exit';

        // Mark the container for check so it can react if the
        // view container is using OnPush change detection.
        this.changeDetectorRef.markForCheck();
    }

    @HostListener('@dialog.start', ['$event'])
    _onAnimationStart(event: AnimationEvent) {
        if (event.toState === 'enter') {
            this._beforeEnter.next();
        }
        if (event.fromState === 'enter' && (event.toState === 'void' || event.toState === 'exit')) {
            this._beforeExit.next();
        }
    }

    @HostListener('@dialog.done', ['$event'])
    _onAnimationDone(event: AnimationEvent) {
        if (event.toState === 'enter') {
            this.autoFocusFirstTabbableElement();
            this._afterEnter.next();
        }

        if (event.fromState === 'enter' && (event.toState === 'void' || event.toState === 'exit')) {
            this.returnFocusAfterDialog();
            this._afterExit.next();
        }
    }

    private autoFocusFirstTabbableElement() {
        // If were to attempt to focus immediately, then the content of the dialog would not yet be
        // ready in instances where change detection has to run first. To deal with this, we simply
        // wait for the microtask queue to be empty.
        if (this.config.autoFocus) {
            this._focusTrap.focusInitialElementWhenReady().then((hasMovedFocus) => {
                // If we didn't find any focusable elements inside the dialog, focus the
                // container so the user can't tab into other elements behind it.
                if (!hasMovedFocus) {
                    this.elementRef.nativeElement.focus();
                }
            });
        }
    }

    private savePreviouslyFocusedElement() {
        this._elementFocusedBeforeDialogWasOpened = this.document.activeElement as HTMLElement;

        // Move focus onto the dialog immediately in apply to prevent the user from accidentally
        // opening multiple dialogs at the same time. Needs to be async, because the element
        // may not be focusable immediately.
        Promise.resolve().then(() => this.elementRef.nativeElement.focus());
    }

    private returnFocusAfterDialog() {
        const toFocus = this._elementFocusedBeforeDialogWasOpened;

        // We need the extra check, because IE can set the `activeElement` to null in some cases.
        if (toFocus && typeof toFocus.focus === 'function') {
            toFocus.focus();
        }
    }
}
