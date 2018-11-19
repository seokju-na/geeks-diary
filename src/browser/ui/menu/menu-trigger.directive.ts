/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { FocusMonitor, FocusOrigin, isFakeMousedownFromScreenReader } from '@angular/cdk/a11y';
import { RIGHT_ARROW } from '@angular/cdk/keycodes';
import {
    FlexibleConnectedPositionStrategy,
    HorizontalConnectionPos,
    Overlay,
    OverlayConfig,
    OverlayRef,
    VerticalConnectionPos,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
    AfterContentInit,
    Directive,
    ElementRef,
    HostListener,
    Input,
    OnDestroy,
    Optional,
    Self,
    ViewContainerRef,
} from '@angular/core';
import { asapScheduler, merge, of, Subscription } from 'rxjs';
import { delay, filter, take, takeUntil } from 'rxjs/operators';
import { MenuItemComponent } from './menu-item.component';
import { MenuPanel } from './menu-panel';
import { MenuPositionX, MenuPositionY } from './menu-positions';
import { MenuComponent } from './menu.component';


@Directive({
    selector: '[gdMenuTrigger]',
    host: {
        'aria-haspopup': 'true',
        '[attr.aria-expanded]': 'menuOpen || null',
    },
    exportAs: 'gdMenuTrigger',
})
export class MenuTriggerDirective implements AfterContentInit, OnDestroy {
    // Tracking input type is necessary so it's possible to only auto-focus
    // the first item of the list when the menu is opened via the keyboard
    _openedBy: 'mouse' | 'touch' | null = null;

    private _portal: TemplatePortal;
    private _overlayRef: OverlayRef | null = null;

    private _closeSubscription = Subscription.EMPTY;
    private _hoverSubscription = Subscription.EMPTY;
    private _menuCloseSubscription = Subscription.EMPTY;

    constructor(
        private _overlay: Overlay,
        private _elementRef: ElementRef<HTMLElement>,
        private _viewContainerRef: ViewContainerRef,
        @Optional() private _parentMenu: MenuComponent,
        @Optional() @Self() private _menuItem: MenuItemComponent,
        private _focusMonitor: FocusMonitor,
    ) {
        if (_menuItem) {
            _menuItem._triggersSubmenu = this.triggersSubmenu();
        }
    }

    private _menuOpen: boolean = false;

    get menuOpen(): boolean {
        return this._menuOpen;
    }

    private _menu: MenuPanel;

    @Input('gdMenuTrigger')
    get menu() {
        return this._menu;
    }

    set menu(menu: MenuPanel) {
        if (menu === this._menu) {
            return;
        }

        this._menu = menu;
        this._menuCloseSubscription.unsubscribe();

        if (menu) {
            this._menuCloseSubscription = menu.closed.asObservable().subscribe((reason) => {
                this._destroyMenu();

                // If a click closed the menu, we should close the entire chain of nested menus.
                if ((reason === 'click' || reason === 'tab') && this._parentMenu) {
                    this._parentMenu.closed.emit(reason);
                }
            });
        }
    }

    ngAfterContentInit(): void {
        this._checkMenu();
        this._handleHover();
    }

    ngOnDestroy(): void {
        if (this._overlayRef) {
            this._overlayRef.dispose();
            this._overlayRef = null;
        }

        this._cleanUpSubscriptions();
    }

    /** Whether the menu triggers a sub-menu or a top-level one. */
    triggersSubmenu(): boolean {
        return !!(this._menuItem && this._parentMenu);
    }

    /** Toggles the menu between the open and closed states. */
    toggleMenu(): void {
        return this._menuOpen ? this.closeMenu() : this.openMenu();
    }

    openMenu(): void {
        if (this._menuOpen) {
            return;
        }

        this._checkMenu();

        const overlayRef = this._createOverlay();
        this._setPosition(overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy);
        overlayRef.attach(this._getPortal());

        this._closeSubscription = this._menuClosingActions().subscribe(() => this.closeMenu());
        this._initMenu();

        if (this.menu instanceof MenuComponent) {
            this.menu._startAnimation();
        }
    }

    /** Closes the menu. */
    closeMenu(): void {
        this.menu.closed.emit();
    }

    /**
     * Focuses the menu trigger.
     * @param origin Source of the menu trigger's focus.
     */
    focus(origin: FocusOrigin = 'program') {
        this._focusMonitor.focusVia(this._elementRef.nativeElement, origin);

    }

    /** Handles mouse presses on the trigger. */
    @HostListener('mousedown', ['$event'])
    _handleMousedown(event: MouseEvent): void {
        if (!isFakeMousedownFromScreenReader(event)) {
            // Since right or middle button clicks won't trigger the `click` event,
            // we shouldn't consider the menu as opened by mouse in those cases.
            this._openedBy = event.button === 0 ? 'mouse' : null;

            // Since clicking on the trigger won't close the menu if it opens a sub-menu,
            // we should prevent focus from moving onto it via click to avoid the
            // highlight from lingering on the menu item.
            if (this.triggersSubmenu()) {
                event.preventDefault();
            }
        }
    }

    /** Handles key presses on the trigger. */
    @HostListener('keydown', ['$event'])
    _handleKeydown(event: KeyboardEvent): void {
        const keyCode = event.keyCode;

        if (this.triggersSubmenu() && keyCode === RIGHT_ARROW) {
            this.openMenu();
        }
    }

    /** Handles click events on the trigger. */
    @HostListener('click', ['$event'])
    _handleClick(event: MouseEvent): void {
        if (this.triggersSubmenu()) {
            // Stop event propagation to avoid closing the parent menu.
            event.stopPropagation();
            this.openMenu();
        } else {
            this.toggleMenu();
        }
    }

    private _initMenu(): void {
        this.menu.parentMenu = this.triggersSubmenu() ? this._parentMenu : undefined;
        this._setIsMenuOpen(true);
        this.menu.focusFirstItem(this._openedBy || 'program');
    }

    /** Closes the menu and does the necessary cleanup. */
    private _destroyMenu() {
        if (!this._overlayRef || !this.menuOpen) {
            return;
        }

        const menu = this.menu;

        this._closeSubscription.unsubscribe();
        this._overlayRef.detach();

        if (menu instanceof MenuComponent) {
            menu._resetAnimation();
        }

        this._resetMenu();
    }

    /**
     * This method checks that a valid instance of MatMenu has been passed into
     * matMenuTriggerFor. If not, an exception is thrown.
     */
    private _checkMenu() {
        if (!this.menu) {
            throw new Error('Mush pass in an gd-menu instance.');
        }
    }

    /**
     * This method resets the menu when it's closed, most importantly restoring
     * focus to the menu trigger if the menu was opened via the keyboard.
     */
    private _resetMenu(): void {
        this._setIsMenuOpen(false);

        // We should reset focus if the user is navigating using a keyboard or
        // if we have a top-level trigger which might cause focus to be lost
        // when clicking on the backdrop.
        if (!this._openedBy) {
            // Note that the focus style will show up both for `program` and
            // `keyboard` so we don't have to specify which one it is.
            this.focus();
        } else if (!this.triggersSubmenu()) {
            this.focus(this._openedBy);
        }

        this._openedBy = null;
    }

    // set state rather than toggle to support triggers sharing a menu
    private _setIsMenuOpen(isOpen: boolean): void {
        this._menuOpen = isOpen;

        if (this.triggersSubmenu()) {
            this._menuItem._highlighted = isOpen;
        }
    }

    /**
     * This method creates the overlay from the provided menu's template and saves its
     * OverlayRef so that it can be attached to the DOM when openMenu is called.
     */
    private _createOverlay(): OverlayRef {
        if (!this._overlayRef) {
            const config = this._getOverlayConfig();
            this._subscribeToPositions(config.positionStrategy as FlexibleConnectedPositionStrategy);
            this._overlayRef = this._overlay.create(config);

            // Consume the `keydownEvents` in order to prevent them from going to another overlay.
            // Ideally we'd also have our keyboard event logic in here, however doing so will
            // break anybody that may have implemented the `MatMenuPanel` themselves.
            this._overlayRef.keydownEvents().subscribe();
        }

        return this._overlayRef;
    }

    /**
     * This method builds the configuration object needed to create the overlay, the OverlayState.
     * @returns OverlayConfig
     */
    private _getOverlayConfig(): OverlayConfig {
        return new OverlayConfig({
            positionStrategy: this._overlay.position()
                .flexibleConnectedTo(this._elementRef)
                .withLockedPosition()
                .withTransformOriginOn('.Menu'),

            hasBackdrop: this.menu.hasBackdrop == null ? !this.triggersSubmenu() : this.menu.hasBackdrop,
            backdropClass: this.menu.backdropClass || 'cdk-overlay-transparent-backdrop',
            scrollStrategy: this._overlay.scrollStrategies.reposition(),
        });
    }

    /**
     * Listens to changes in the position of the overlay and sets the correct classes
     * on the menu based on the new position. This ensures the animation origin is always
     * correct, even if a fallback position is used for the overlay.
     */
    private _subscribeToPositions(position: FlexibleConnectedPositionStrategy): void {
        if (this.menu.setPositionClasses) {
            position.positionChanges.subscribe(change => {
                const posX: MenuPositionX = change.connectionPair.overlayX === 'start' ? 'after' : 'before';
                const posY: MenuPositionY = change.connectionPair.overlayY === 'top' ? 'below' : 'above';

                this.menu.setPositionClasses(posX, posY);
            });
        }
    }

    /**
     * Sets the appropriate positions on a position strategy
     * so the overlay connects with the trigger correctly.
     * @param positionStrategy Strategy whose position to update.
     */
    private _setPosition(positionStrategy: FlexibleConnectedPositionStrategy) {
        let [originX, originFallbackX]: HorizontalConnectionPos[] =
            this.menu.xPosition === 'before' ? ['end', 'start'] : ['start', 'end'];

        const [overlayY, overlayFallbackY]: VerticalConnectionPos[] =
            this.menu.yPosition === 'above' ? ['bottom', 'top'] : ['top', 'bottom'];

        let [originY, originFallbackY] = [overlayY, overlayFallbackY];
        let [overlayX, overlayFallbackX] = [originX, originFallbackX];
        const offsetY = 0;

        if (this.triggersSubmenu()) {
            // When the menu is a sub-menu, it should always align itself
            // to the edges of the trigger, instead of overlapping it.
            overlayFallbackX = originX = this.menu.xPosition === 'before' ? 'start' : 'end';
            originFallbackX = overlayX = originX === 'end' ? 'start' : 'end';
        } else if (!this.menu.overlapTrigger) {
            originY = overlayY === 'top' ? 'bottom' : 'top';
            originFallbackY = overlayFallbackY === 'top' ? 'bottom' : 'top';
        }

        positionStrategy.withPositions([
            { originX, originY, overlayX, overlayY, offsetY },
            { originX: originFallbackX, originY, overlayX: overlayFallbackX, overlayY, offsetY },
            {
                originX,
                originY: originFallbackY,
                overlayX,
                overlayY: overlayFallbackY,
                offsetY: -offsetY,
            },
            {
                originX: originFallbackX,
                originY: originFallbackY,
                overlayX: overlayFallbackX,
                overlayY: overlayFallbackY,
                offsetY: -offsetY,
            },
        ]);
    }

    /** Cleans up the active subscriptions. */
    private _cleanUpSubscriptions(): void {
        this._closeSubscription.unsubscribe();
        this._hoverSubscription.unsubscribe();
    }

    /** Returns a stream that emits whenever an action that should close the menu occurs. */
    private _menuClosingActions() {
        const backdrop = this._overlayRef.backdropClick();
        const detachments = this._overlayRef.detachments();
        const parentClose = this._parentMenu ? this._parentMenu.closed : of();
        const hover = this._parentMenu ? this._parentMenu._hovered().pipe(
            filter(active => active !== this._menuItem),
            filter(() => this._menuOpen),
        ) : of();

        return merge(backdrop, parentClose, hover, detachments);
    }

    /** Handles the cases where the user hovers over the trigger. */
    private _handleHover(): void {
        // Subscribe to changes in the hovered item in order to toggle the panel.
        if (!this.triggersSubmenu()) {
            return;
        }

        this._hoverSubscription = this._parentMenu._hovered()
            // Since we might have multiple competing triggers for the same menu (e.g. a sub-menu
            // with different data and triggers), we have to delay it by a tick to ensure that
            // it won't be closed immediately after it is opened.
            .pipe(
                filter(active => active === this._menuItem && !active.disabled),
                delay(0, asapScheduler),
            )
            .subscribe(() => {
                this._openedBy = 'mouse';

                // If the same menu is used between multiple triggers, it might still be animating
                // while the new trigger tries to re-open it. Wait for the animation to finish
                // before doing so. Also interrupt if the user moves to another item.
                if (this.menu instanceof MenuComponent && this.menu._isAnimating) {
                    // We need the `delay(0)` here in order to avoid
                    // 'changed after checked' errors in some cases. See #12194.
                    this.menu._animationDone
                        .pipe(take(1), delay(0, asapScheduler), takeUntil(this._parentMenu._hovered()))
                        .subscribe(() => this.openMenu());
                } else {
                    this.openMenu();
                }
            });
    }

    /** Gets the portal that should be attached to the overlay. */
    private _getPortal(): TemplatePortal {
        // Note that we can avoid this check by keeping the portal on the menu panel.
        // While it would be cleaner, we'd have to introduce another required method on
        // `MatMenuPanel`, making it harder to consume.
        if (!this._portal || this._portal.templateRef !== this.menu.templateRef) {
            this._portal = new TemplatePortal(this.menu.templateRef, this._viewContainerRef);
        }

        return this._portal;
    }
}
