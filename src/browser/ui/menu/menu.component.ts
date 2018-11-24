/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AnimationEvent } from '@angular/animations';
import { FocusKeyManager, FocusOrigin } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { DOWN_ARROW, ESCAPE, LEFT_ARROW, UP_ARROW } from '@angular/cdk/keycodes';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    InjectionToken,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Output,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { merge, Observable, Subject, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { menuAnimations } from './menu-animations';
import { MenuItemComponent } from './menu-item.component';
import { MENU_PANEL, MenuPanel } from './menu-panel';
import { MenuPositionX, MenuPositionY } from './menu-positions';


/** Default `mat-menu` options that can be overridden. */
export interface MenuDefaultOptions {
    /** The x-axis position of the menu. */
    xPosition: MenuPositionX;

    /** The y-axis position of the menu. */
    yPosition: MenuPositionY;

    /** Whether the menu should overlap the menu trigger. */
    overlapTrigger: boolean;

    /** Class to be applied to the menu's backdrop. */
    backdropClass: string;

    /** Whether the menu has a backdrop. */
    hasBackdrop?: boolean;
}

/** Injection token to be used to override the default options for `mat-menu`. */
export const MENU_DEFAULT_OPTIONS =
    new InjectionToken<MenuDefaultOptions>('MenuDefaultOptions', {
        providedIn: 'root',
        factory: MENU_DEFAULT_OPTIONS_FACTORY,
    });

/** @docs-private */
export function MENU_DEFAULT_OPTIONS_FACTORY(): MenuDefaultOptions {
    return {
        overlapTrigger: false,
        xPosition: 'after',
        yPosition: 'below',
        backdropClass: 'cdk-overlay-transparent-backdrop',
    };
}


@Component({
    selector: 'gd-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    exportAs: 'gdMenu',
    providers: [
        { provide: MENU_PANEL, useExisting: MenuComponent },
    ],
    animations: [
        menuAnimations.transformMenu,
        menuAnimations.fadeInItems,
    ],
})
export class MenuComponent implements MenuPanel<MenuItemComponent>, OnInit, AfterContentInit, OnDestroy {
    /** Config object to be passed into the menu's ngClass */
    _classList: { [key: string]: boolean } = {};

    /** Current state of the panel animation. */
    _panelAnimationState: 'void' | 'enter' = 'void';

    /** Whether the menu is animating. */
    _isAnimating: boolean;

    /** Parent menu of the current menu panel. */
    parentMenu: MenuPanel | undefined;

    /** @docs-private */
    @ViewChild(TemplateRef) templateRef: TemplateRef<any>;

    /** Event emitted when the menu is closed. */
    @Output() readonly closed = new EventEmitter<void | 'click' | 'keydown' | 'tab'>();

    _animationDone = new Subject<AnimationEvent>();

    private _keyManager: FocusKeyManager<MenuItemComponent>;

    /** Menu items inside the current menu. */
    private _items: MenuItemComponent[] = [];

    /** Emits whenever the amount of menu items changes. */
    private _itemChanges = new Subject<MenuItemComponent[]>();

    /** Subscription to tab events on the menu panel */
    private _tabSubscription = Subscription.EMPTY;

    constructor(
        private _elementRef: ElementRef<HTMLElement>,
        private _ngZone: NgZone,
        @Inject(MENU_DEFAULT_OPTIONS) private _defaultOptions: MenuDefaultOptions,
    ) {
    }

    /**
     * This method takes classes set on the host mat-menu element and applies them on the
     * menu template that displays in the overlay container. Otherwise, it's difficult
     * to style the containing menu from outside the component.
     * @param classes list of class names
     */
    @Input('class')
    set panelClass(classes: string) {
        if (classes && classes.length) {
            this._classList = classes.split(' ').reduce((obj: any, className: string) => {
                obj[className] = true;
                return obj;
            }, {});

            this._elementRef.nativeElement.className = '';
        }
    }

    private _xPosition: MenuPositionX = this._defaultOptions.xPosition;

    /** Position of the menu in the X axis. */
    @Input()
    get xPosition(): MenuPositionX {
        return this._xPosition;
    }

    set xPosition(value: MenuPositionX) {
        if (value !== 'before' && value !== 'after') {
            throw new Error('invalid x position');
        }
        this._xPosition = value;
        this.setPositionClasses();
    }

    private _yPosition: MenuPositionY = this._defaultOptions.yPosition;

    /** Position of the menu in the Y axis. */
    @Input()
    get yPosition(): MenuPositionY {
        return this._yPosition;
    }

    set yPosition(value: MenuPositionY) {
        if (value !== 'above' && value !== 'below') {
            throw new Error('invalid y position');
        }
        this._yPosition = value;
        this.setPositionClasses();
    }

    private _overlapTrigger: boolean = this._defaultOptions.overlapTrigger;

    /** Whether the menu should overlap its trigger. */
    @Input()
    get overlapTrigger(): boolean {
        return this._overlapTrigger;
    }

    set overlapTrigger(value: boolean) {
        this._overlapTrigger = coerceBooleanProperty(value);
    }

    ngOnInit(): void {
    }

    ngAfterContentInit(): void {
        this._keyManager = new FocusKeyManager<MenuItemComponent>(this._items).withWrap().withTypeAhead();
        this._tabSubscription = this._keyManager.tabOut.subscribe(() => this.closed.emit('tab'));
    }

    ngOnDestroy(): void {
        this._tabSubscription.unsubscribe();
        this.closed.complete();
    }

    /** Stream that emits whenever the hovered menu item changes. */
    _hovered(): Observable<MenuItemComponent> {
        return this._itemChanges.pipe(
            startWith(this._items),
            switchMap(items => merge(...items.map(item => item._hovered))),
        );
    }

    /** Handle a keyboard event from the menu, delegating to the appropriate action. */
    _handleKeydown(event: KeyboardEvent) {
        const keyCode = event.keyCode;

        switch (keyCode) {
            case ESCAPE:
                this.closed.emit('keydown');
                break;
            case LEFT_ARROW:
                if (this.parentMenu) {
                    this.closed.emit('keydown');
                }
                break;
            default:
                if (keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
                    this._keyManager.setFocusOrigin('keyboard');
                }
                this._keyManager.onKeydown(event);
        }
    }

    /**
     * Focus the first item in the menu.
     * @param origin Action from which the focus originated. Used to set the correct styling.
     */
    focusFirstItem(origin: FocusOrigin = 'program'): void {
        this._keyManager.setFocusOrigin(origin).setFirstItemActive();
    }

    /**
     * Resets the active item in the menu. This is used when the menu is opened, allowing
     * the user to start from the first option when pressing the down arrow.
     */
    resetActiveItem(): void {
        this._keyManager.setActiveItem(-1);
    }

    /**
     * Registers a menu item with the menu.
     * @docs-private
     */
    addItem(item: MenuItemComponent): void {
        // We register the items through this method, rather than picking them up through
        // `ContentChildren`, because we need the items to be picked up by their closest
        // `mat-menu` ancestor. If we used `@ContentChildren(MatMenuItem, {descendants: true})`,
        // all descendant items will bleed into the top-level menu in the case where the consumer
        // has `mat-menu` instances nested inside each other.
        if (this._items.indexOf(item) === -1) {
            this._items.push(item);
            this._itemChanges.next(this._items);
        }
    }

    /**
     * Removes an item from the menu.
     * @docs-private
     */
    removeItem(item: MenuItemComponent): void {
        const index = this._items.indexOf(item);

        if (this._items.indexOf(item) > -1) {
            this._items.splice(index, 1);
            this._itemChanges.next(this._items);
        }
    }

    /**
     * Adds classes to the menu panel based on its position. Can be used by
     * consumers to add specific styling based on the position.
     * @param posX Position of the menu along the x axis.
     * @param posY Position of the menu along the y axis.
     * @docs-private
     */
    setPositionClasses(posX: MenuPositionX = this.xPosition, posY: MenuPositionY = this.yPosition): void {
        const classes = this._classList;
        classes['Menu--before'] = posX === 'before';
        classes['Menu--after'] = posX === 'after';
        classes['Menu--above'] = posY === 'above';
        classes['Menu--below'] = posY === 'below';
    }

    /** Starts the enter animation. */
    _startAnimation() {
        this._panelAnimationState = 'enter';
    }

    /** Resets the panel animation to its initial state. */
    _resetAnimation() {
        this._panelAnimationState = 'void';
    }

    /** Callback that is invoked when the panel animation completes. */
    _onAnimationDone(event: AnimationEvent) {
        this._animationDone.next(event);
        this._isAnimating = false;

        // Scroll the content element to the top once the animation is done. This is necessary, because
        // we move focus to the first item while it's still being animated, which can throw the browser
        // off when it determines the scroll position. Alternatively we can move focus when the
        // animation is done, however moving focus asynchronously will interrupt screen readers
        // which are in the process of reading out the menu already. We take the `element` from
        // the `event` since we can't use a `ViewChild` to access the pane.
        if (event.toState === 'enter' && this._keyManager.activeItemIndex === 0) {
            event.element.scrollTop = 0;
        }
    }
}
