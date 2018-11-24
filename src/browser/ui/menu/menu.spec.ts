/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { FocusMonitor } from '@angular/cdk/a11y';
import { DOWN_ARROW, ESCAPE, LEFT_ARROW, RIGHT_ARROW, TAB } from '@angular/cdk/keycodes';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, ElementRef, QueryList, Type, ViewChild, ViewChildren } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    createKeyboardEvent,
    createMouseEvent,
    dispatchEvent,
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    dispatchMouseEvent,
    fastTestSetup,
    patchElementFocus,
} from '../../../../test/helpers';
import { MenuItemComponent } from './menu-item.component';
import { MenuTriggerDirective } from './menu-trigger.directive';
import { MenuComponent } from './menu.component';
import { MenuModule } from './menu.module';


describe('browser.ui.menu', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let focusMonitor: FocusMonitor;

    function createFixture<T>(component: Type<T>): ComponentFixture<T> {
        return TestBed.createComponent(component);
    }

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                imports: [
                    MenuModule,
                    NoopAnimationsModule,
                ],
                declarations: [
                    SimpleMenuComponent,
                    NestedMenuComponent,
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        overlayContainer = TestBed.get(OverlayContainer);
        overlayContainerElement = overlayContainer.getContainerElement();
        focusMonitor = TestBed.get(FocusMonitor);
    });

    afterEach(() => {
        const currentOverlayContainer = TestBed.get(OverlayContainer);

        // Since we're resetting the testing module in some of the tests,
        // we can potentially have multiple overlay containers.
        currentOverlayContainer.ngOnDestroy();
        overlayContainer.ngOnDestroy();
    });

    it('should open the menu as an idempotent operation', () => {
        const fixture = createFixture(SimpleMenuComponent);
        fixture.detectChanges();

        expect(overlayContainerElement.textContent).toBe('');
        expect(() => {
            fixture.componentInstance.trigger.openMenu();
            fixture.componentInstance.trigger.openMenu();
            fixture.detectChanges();

            expect(overlayContainerElement.textContent).toContain('Item');
            expect(overlayContainerElement.textContent).toContain('Disabled');
        }).not.toThrowError();
    });

    it('should close the menu when a click occurs outside the menu', fakeAsync(() => {
        const fixture = createFixture(SimpleMenuComponent);
        fixture.detectChanges();
        fixture.componentInstance.trigger.openMenu();

        const backdrop = <HTMLElement>overlayContainerElement.querySelector('.cdk-overlay-backdrop');
        backdrop.click();
        fixture.detectChanges();
        tick(500);

        expect(overlayContainerElement.textContent).toBe('');
    }));


    it('should restore focus to the trigger when the menu was opened by keyboard', fakeAsync(() => {
        const fixture = createFixture(SimpleMenuComponent);
        fixture.detectChanges();

        const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

        // A click without a mousedown before it is considered a keyboard open.
        triggerEl.click();
        fixture.detectChanges();

        expect(overlayContainerElement.querySelector('.Menu')).toBeTruthy();

        fixture.componentInstance.trigger.closeMenu();
        fixture.detectChanges();
        tick(500);

        expect(document.activeElement).toBe(triggerEl);
    }));


    it('should restore focus to the root trigger when the menu was opened by mouse', fakeAsync(() => {
        const fixture = createFixture(SimpleMenuComponent);
        fixture.detectChanges();

        const triggerEl = fixture.componentInstance.triggerEl.nativeElement;
        dispatchFakeEvent(triggerEl, 'mousedown');
        triggerEl.click();
        fixture.detectChanges();

        expect(overlayContainerElement.querySelector('.Menu')).toBeTruthy();

        fixture.componentInstance.trigger.closeMenu();
        fixture.detectChanges();
        tick(500);

        expect(document.activeElement).toBe(triggerEl);
    }));

    it('should scroll the panel to the top on open, when it is scrollable', fakeAsync(() => {
        const fixture = createFixture(SimpleMenuComponent);
        fixture.detectChanges();

        // Add 50 items to make the menu scrollable
        fixture.componentInstance.extraItems = new Array(50).fill('Hello there');
        fixture.detectChanges();

        const triggerEl = fixture.componentInstance.triggerEl.nativeElement;
        dispatchFakeEvent(triggerEl, 'mousedown');
        triggerEl.click();
        fixture.detectChanges();

        // Flush due to the additional tick that is necessary for the FocusMonitor.
        flush();

        expect(overlayContainerElement.querySelector('.Menu').scrollTop).toBe(0);
    }));

    it(
        'should set the proper focus origin when restoring focus after opening by keyboard',
        fakeAsync(() => {
            const fixture = createFixture(SimpleMenuComponent);
            fixture.detectChanges();

            const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

            patchElementFocus(triggerEl);
            focusMonitor.monitor(triggerEl, false);
            triggerEl.click(); // A click without a mousedown before it is considered a keyboard open.
            fixture.detectChanges();
            fixture.componentInstance.trigger.closeMenu();
            fixture.detectChanges();
            tick(500);
            fixture.detectChanges();

            expect(triggerEl.classList).toContain('cdk-program-focused');
            focusMonitor.stopMonitoring(triggerEl);
        }),
    );

    it(
        'should set the proper focus origin when restoring focus after opening by mouse',
        fakeAsync(() => {
            const fixture = createFixture(SimpleMenuComponent);
            fixture.detectChanges();
            const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

            dispatchMouseEvent(triggerEl, 'mousedown');
            triggerEl.click();
            fixture.detectChanges();
            patchElementFocus(triggerEl);
            focusMonitor.monitor(triggerEl, false);
            fixture.componentInstance.trigger.closeMenu();
            fixture.detectChanges();
            tick(500);
            fixture.detectChanges();

            expect(triggerEl.classList).toContain('cdk-mouse-focused');
            focusMonitor.stopMonitoring(triggerEl);
        }),
    );

    it(
        'should set proper focus origin when right clicking on trigger, before opening by keyboard',
        fakeAsync(() => {
            const fixture = createFixture(SimpleMenuComponent);
            fixture.detectChanges();
            const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

            patchElementFocus(triggerEl);
            focusMonitor.monitor(triggerEl, false);

            // Trigger a fake right click.
            dispatchEvent(triggerEl, createMouseEvent('mousedown', 50, 100, 2));

            // A click without a left button mousedown before it is considered a keyboard open.
            triggerEl.click();
            fixture.detectChanges();

            fixture.componentInstance.trigger.closeMenu();
            fixture.detectChanges();
            tick(500);
            fixture.detectChanges();

            expect(triggerEl.classList).toContain('cdk-program-focused');
            focusMonitor.stopMonitoring(triggerEl);
        }),
    );

    it('should close the menu when pressing ESCAPE', fakeAsync(() => {
        const fixture = createFixture(SimpleMenuComponent);
        fixture.detectChanges();
        fixture.componentInstance.trigger.openMenu();

        const panel = overlayContainerElement.querySelector('.Menu');
        const event = createKeyboardEvent('keydown', ESCAPE);

        dispatchEvent(panel, event);
        fixture.detectChanges();
        tick(500);

        expect(overlayContainerElement.textContent).toBe('');
    }));

    it('should transfer any custom classes from the host to the overlay', () => {
        const fixture = createFixture(SimpleMenuComponent);

        fixture.detectChanges();
        fixture.componentInstance.trigger.openMenu();
        fixture.detectChanges();

        const menuEl = fixture.debugElement.query(By.css('gd-menu')).nativeElement;
        const panel = overlayContainerElement.querySelector('.Menu');

        expect(menuEl.classList).not.toContain('custom-one');
        expect(menuEl.classList).not.toContain('custom-two');

        expect(panel.classList).toContain('custom-one');
        expect(panel.classList).toContain('custom-two');
    });

    it('should set the "menu" role on the overlay panel', () => {
        const fixture = createFixture(SimpleMenuComponent);
        fixture.detectChanges();
        fixture.componentInstance.trigger.openMenu();
        fixture.detectChanges();

        const menuPanel = overlayContainerElement.querySelector('.Menu');
        expect(menuPanel).toBeTruthy('Expected to find a menu panel.');

        const role = menuPanel ? menuPanel.getAttribute('role') : '';
        expect(role).toBe('menu', 'Expected panel to have the "menu" role.');
    });

    it('should not throw an error on destroy', () => {
        const fixture = createFixture(SimpleMenuComponent);
        expect(fixture.destroy.bind(fixture)).not.toThrow();
    });

    it('should be able to extract the menu item text', () => {
        const fixture = createFixture(SimpleMenuComponent);
        fixture.detectChanges();
        expect(fixture.componentInstance.items.first.getLabel()).toBe('Item');
    });

    it('should filter out non-text nodes when figuring out the label', () => {
        const fixture = createFixture(SimpleMenuComponent);
        fixture.detectChanges();
        expect(fixture.componentInstance.items.last.getLabel()).toBe('Item with an icon');
    });

    it('should set the proper focus origin when opening by mouse', fakeAsync(() => {
        const fixture = createFixture(SimpleMenuComponent);
        fixture.detectChanges();
        spyOn(fixture.componentInstance.items.first, 'focus').and.callThrough();

        const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

        dispatchMouseEvent(triggerEl, 'mousedown');
        triggerEl.click();
        fixture.detectChanges();
        tick(500);

        expect(fixture.componentInstance.items.first.focus).toHaveBeenCalledWith('mouse');
    }));

    it(
        'should switch to keyboard focus when using the keyboard after opening using the mouse',
        fakeAsync(() => {
            const fixture = createFixture(SimpleMenuComponent);

            fixture.detectChanges();
            fixture.componentInstance.triggerEl.nativeElement.click();
            fixture.detectChanges();

            const panel = document.querySelector('.Menu') as HTMLElement;
            const items: HTMLElement[] = Array.from(panel.querySelectorAll('.Menu [gd-menu-item]'));

            items.forEach(item => patchElementFocus(item));

            tick(500);
            tick();
            fixture.detectChanges();
            expect(items.some(item => item.classList.contains('cdk-keyboard-focused'))).toBe(false);

            dispatchKeyboardEvent(panel, 'keydown', DOWN_ARROW);
            fixture.detectChanges();

            // Flush due to the additional tick that is necessary for the FocusMonitor.
            flush();

            // We skip to the third item, because the second one is disabled.
            expect(items[2].classList).toContain('cdk-focused');
            expect(items[2].classList).toContain('cdk-keyboard-focused');
        }),
    );

    it('should toggle the aria-expanded attribute on the trigger', () => {
        const fixture = createFixture(SimpleMenuComponent);
        fixture.detectChanges();
        const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

        expect(triggerEl.hasAttribute('aria-expanded')).toBe(false);

        fixture.componentInstance.trigger.openMenu();
        fixture.detectChanges();

        expect(triggerEl.getAttribute('aria-expanded')).toBe('true');

        fixture.componentInstance.trigger.closeMenu();
        fixture.detectChanges();

        expect(triggerEl.hasAttribute('aria-expanded')).toBe(false);
    });

    describe('close event', () => {
        let fixture: ComponentFixture<SimpleMenuComponent>;

        beforeEach(() => {
            fixture = createFixture(SimpleMenuComponent);
            fixture.detectChanges();
            fixture.componentInstance.trigger.openMenu();
            fixture.detectChanges();
        });

        it('should emit an event when a menu item is clicked', () => {
            const menuItem = overlayContainerElement.querySelector('[gd-menu-item]') as HTMLElement;

            menuItem.click();
            fixture.detectChanges();

            expect(fixture.componentInstance.closeCallback).toHaveBeenCalledWith('click');
            expect(fixture.componentInstance.closeCallback).toHaveBeenCalledTimes(1);
        });

        it('should emit a close event when the backdrop is clicked', () => {
            const backdrop = overlayContainerElement
                .querySelector('.cdk-overlay-backdrop') as HTMLElement;

            backdrop.click();
            fixture.detectChanges();

            expect(fixture.componentInstance.closeCallback).toHaveBeenCalledWith(undefined);
            expect(fixture.componentInstance.closeCallback).toHaveBeenCalledTimes(1);
        });

        it('should emit an event when pressing ESCAPE', () => {
            const menu = overlayContainerElement.querySelector('.Menu') as HTMLElement;

            dispatchKeyboardEvent(menu, 'keydown', ESCAPE);
            fixture.detectChanges();

            expect(fixture.componentInstance.closeCallback).toHaveBeenCalledWith('keydown');
            expect(fixture.componentInstance.closeCallback).toHaveBeenCalledTimes(1);
        });

        it('should complete the callback when the menu is destroyed', () => {
            const emitCallback = jasmine.createSpy('emit callback');
            const completeCallback = jasmine.createSpy('complete callback');

            fixture.componentInstance.menu.closed.subscribe(emitCallback, null, completeCallback);
            fixture.destroy();

            expect(emitCallback).toHaveBeenCalledWith(undefined);
            expect(emitCallback).toHaveBeenCalledTimes(1);
            expect(completeCallback).toHaveBeenCalled();
        });
    });

    describe('nested menu', () => {
        let fixture: ComponentFixture<NestedMenuComponent>;
        let instance: NestedMenuComponent;
        let overlay: HTMLElement;
        const compileTestComponent = () => {
            fixture = createFixture(NestedMenuComponent);
            fixture.detectChanges();
            instance = fixture.componentInstance;
            overlay = overlayContainerElement;
        };

        it('should set the `triggersSubmenu` flags on the triggers', () => {
            compileTestComponent();
            expect(instance.rootTrigger.triggersSubmenu()).toBe(false);
            expect(instance.levelOneTrigger.triggersSubmenu()).toBe(true);
            expect(instance.levelTwoTrigger.triggersSubmenu()).toBe(true);
        });

        it('should set the `parentMenu` on the sub-menu instances', () => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();

            instance.levelOneTrigger.openMenu();
            fixture.detectChanges();

            instance.levelTwoTrigger.openMenu();
            fixture.detectChanges();

            expect(instance.rootMenu.parentMenu).toBeFalsy();
            expect(instance.levelOneMenu.parentMenu).toBe(instance.rootMenu);
            expect(instance.levelTwoMenu.parentMenu).toBe(instance.levelOneMenu);
        });

        it('should emit an event when the hover state of the menu items changes', () => {
            compileTestComponent();
            instance.rootTrigger.openMenu();
            fixture.detectChanges();

            const spy = jasmine.createSpy('hover spy');
            const subscription = instance.rootMenu._hovered().subscribe(spy);
            const menuItems = overlay.querySelectorAll('[gd-menu-item]');

            dispatchMouseEvent(menuItems[0], 'mouseenter');
            fixture.detectChanges();

            expect(spy).toHaveBeenCalledTimes(1);

            dispatchMouseEvent(menuItems[1], 'mouseenter');
            fixture.detectChanges();

            expect(spy).toHaveBeenCalledTimes(2);

            subscription.unsubscribe();
        });

        it('should toggle a nested menu when its trigger is hovered', fakeAsync(() => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();
            expect(overlay.querySelectorAll('.Menu').length).toBe(1, 'Expected one open menu');

            const items = Array.from(overlay.querySelectorAll('.Menu [gd-menu-item]'));
            const levelOneTrigger = overlay.querySelector('#level-one-trigger');

            dispatchMouseEvent(levelOneTrigger, 'mouseenter');
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(levelOneTrigger.classList)
                .toContain('MenuItem--highlighted', 'Expected the trigger to be highlighted');
            expect(overlay.querySelectorAll('.Menu').length).toBe(2, 'Expected two open menus');

            dispatchMouseEvent(items[items.indexOf(levelOneTrigger) + 1], 'mouseenter');
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll('.Menu').length).toBe(1, 'Expected one open menu');
            expect(levelOneTrigger.classList)
                .not.toContain('mat-menu-item-highlighted', 'Expected the trigger to not be highlighted');
        }));

        it(
            'should close all the open sub-menus when the hover state is changed at the root',
            fakeAsync(() => {
                compileTestComponent();
                instance.rootTriggerEl.nativeElement.click();
                fixture.detectChanges();

                const items = Array.from(overlay.querySelectorAll('.Menu [gd-menu-item]'));
                const levelOneTrigger = overlay.querySelector('#level-one-trigger');

                dispatchMouseEvent(levelOneTrigger, 'mouseenter');
                fixture.detectChanges();
                tick();

                const levelTwoTrigger = overlay.querySelector('#level-two-trigger') as HTMLElement;
                dispatchMouseEvent(levelTwoTrigger, 'mouseenter');
                fixture.detectChanges();
                tick();

                expect(overlay.querySelectorAll('.Menu').length)
                    .toBe(3, 'Expected three open menus');

                dispatchMouseEvent(items[items.indexOf(levelOneTrigger) + 1], 'mouseenter');
                fixture.detectChanges();
                tick(500);

                expect(overlay.querySelectorAll('.Menu').length)
                    .toBe(1, 'Expected one open menu');
            }),
        );

        it('should close submenu when hovering over disabled sibling item', fakeAsync(() => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();
            tick(500);

            const items = fixture.debugElement.queryAll(By.directive(MenuItemComponent));

            dispatchFakeEvent(items[0].nativeElement, 'mouseenter');
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll('.Menu').length)
                .toBe(2, 'Expected two open menus');

            items[1].componentInstance.disabled = true;
            fixture.detectChanges();

            // Invoke the handler directly since the fake events are flaky on disabled elements.
            items[1].componentInstance._handleMouseEnter();
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll('.Menu').length)
                .toBe(1, 'Expected one open menu');
        }));

        it('should not open submenu when hovering over disabled trigger', fakeAsync(() => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll('.Menu').length)
                .toBe(1, 'Expected one open menu');

            const item = fixture.debugElement.query(By.directive(MenuItemComponent));

            item.componentInstance.disabled = true;
            fixture.detectChanges();

            // Invoke the handler directly since the fake events are flaky on disabled elements.
            item.componentInstance._handleMouseEnter();
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll('.Menu').length)
                .toBe(1, 'Expected to remain at one open menu');
        }));


        it('should open a nested menu when its trigger is clicked', () => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();
            expect(overlay.querySelectorAll('.Menu').length).toBe(1, 'Expected one open menu');

            const levelOneTrigger = overlay.querySelector('#level-one-trigger') as HTMLElement;

            levelOneTrigger.click();
            fixture.detectChanges();
            expect(overlay.querySelectorAll('.Menu').length).toBe(2, 'Expected two open menus');

            levelOneTrigger.click();
            fixture.detectChanges();
            expect(overlay.querySelectorAll('.Menu').length)
                .toBe(2, 'Expected repeat clicks not to close the menu.');
        });

        it('should open and close a nested menu with arrow keys in ltr', fakeAsync(() => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();
            expect(overlay.querySelectorAll('.Menu').length).toBe(1, 'Expected one open menu');

            const levelOneTrigger = overlay.querySelector('#level-one-trigger') as HTMLElement;

            dispatchKeyboardEvent(levelOneTrigger, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            const panels = overlay.querySelectorAll('.Menu');

            expect(panels.length).toBe(2, 'Expected two open menus');
            dispatchKeyboardEvent(panels[1], 'keydown', LEFT_ARROW);
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll('.Menu').length).toBe(1);
        }));

        it('should not do anything with the arrow keys for a top-level menu', () => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();

            const menu = overlay.querySelector('.Menu');

            dispatchKeyboardEvent(menu, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();
            expect(overlay.querySelectorAll('.Menu').length)
                .toBe(1, 'Expected one menu to remain open');

            dispatchKeyboardEvent(menu, 'keydown', LEFT_ARROW);
            fixture.detectChanges();
            expect(overlay.querySelectorAll('.Menu').length)
                .toBe(1, 'Expected one menu to remain open');
        });

        it('should close all of the menus when the backdrop is clicked', fakeAsync(() => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();

            instance.levelOneTrigger.openMenu();
            fixture.detectChanges();

            instance.levelTwoTrigger.openMenu();
            fixture.detectChanges();

            expect(overlay.querySelectorAll('.Menu').length)
                .toBe(3, 'Expected three open menus');
            expect(overlay.querySelectorAll('.cdk-overlay-backdrop').length)
                .toBe(1, 'Expected one backdrop element');
            expect(overlay.querySelectorAll('.Menu, .cdk-overlay-backdrop')[0].classList)
                .toContain('cdk-overlay-backdrop', 'Expected backdrop to be beneath all of the menus');

            (overlay.querySelector('.cdk-overlay-backdrop') as HTMLElement).click();
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll('.Menu').length).toBe(0, 'Expected no open menus');
        }));

        it('should shift focus between the sub-menus', () => {
            compileTestComponent();
            instance.rootTrigger.openMenu();
            fixture.detectChanges();

            expect(overlay.querySelector('.Menu').contains(document.activeElement))
                .toBe(true, 'Expected focus to be inside the root menu');

            instance.levelOneTrigger.openMenu();
            fixture.detectChanges();

            expect(overlay.querySelectorAll('.Menu')[1].contains(document.activeElement))
                .toBe(true, 'Expected focus to be inside the first nested menu');

            instance.levelTwoTrigger.openMenu();
            fixture.detectChanges();

            expect(overlay.querySelectorAll('.Menu')[2].contains(document.activeElement))
                .toBe(true, 'Expected focus to be inside the second nested menu');

            instance.levelTwoTrigger.closeMenu();
            fixture.detectChanges();

            expect(overlay.querySelectorAll('.Menu')[1].contains(document.activeElement))
                .toBe(true, 'Expected focus to be back inside the first nested menu');

            instance.levelOneTrigger.closeMenu();
            fixture.detectChanges();

            expect(overlay.querySelector('.Menu').contains(document.activeElement))
                .toBe(true, 'Expected focus to be back inside the root menu');
        });

        it('should close all of the menus when an item is clicked', fakeAsync(() => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();

            instance.levelOneTrigger.openMenu();
            fixture.detectChanges();

            instance.levelTwoTrigger.openMenu();
            fixture.detectChanges();

            const menus = overlay.querySelectorAll('.Menu');

            expect(menus.length).toBe(3, 'Expected three open menus');

            (menus[2].querySelector('.MenuItem') as HTMLElement).click();
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll('.Menu').length).toBe(0, 'Expected no open menus');
        }));

        it('should close all of the menus when the user tabs away', fakeAsync(() => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();

            instance.levelOneTrigger.openMenu();
            fixture.detectChanges();

            instance.levelTwoTrigger.openMenu();
            fixture.detectChanges();

            const menus = overlay.querySelectorAll('.Menu');
            expect(menus.length).toBe(3, 'Expected three open menus');

            dispatchKeyboardEvent(menus[menus.length - 1], 'keydown', TAB);
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll('.Menu').length).toBe(0, 'Expected no open menus');
        }));

        it('should set a class on the menu items that trigger a sub-menu', () => {
            compileTestComponent();
            instance.rootTrigger.openMenu();
            fixture.detectChanges();

            const menuItems = overlay.querySelectorAll('[gd-menu-item]');

            expect(menuItems[0].classList).toContain('MenuItem--submenuTrigger');
            expect(menuItems[1].classList).not.toContain('MenuItem--submenuTrigger');
        });

        it('should close all of the menus when the root is closed programmatically', fakeAsync(() => {
            compileTestComponent();
            instance.rootTrigger.openMenu();
            fixture.detectChanges();

            instance.levelOneTrigger.openMenu();
            fixture.detectChanges();

            instance.levelTwoTrigger.openMenu();
            fixture.detectChanges();

            const menus = overlay.querySelectorAll('.Menu');

            expect(menus.length).toBe(3, 'Expected three open menus');

            instance.rootTrigger.closeMenu();
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll('.Menu').length).toBe(0, 'Expected no open menus');
        }));

        it('should prevent the default mousedown action if the menu item opens a sub-menu', () => {
            compileTestComponent();
            instance.rootTrigger.openMenu();
            fixture.detectChanges();

            const event = createMouseEvent('mousedown');

            Object.defineProperty(event, 'buttons', { get: () => 1 });
            event.preventDefault = jasmine.createSpy('preventDefault spy');

            dispatchMouseEvent(overlay.querySelector('[gd-menu-item]'), 'mousedown', 0, 0, event);
            expect(event.preventDefault).toHaveBeenCalled();
        });

        it('should not re-focus a child menu trigger when hovering another trigger', fakeAsync(() => {
            compileTestComponent();

            dispatchFakeEvent(instance.rootTriggerEl.nativeElement, 'mousedown');
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();

            const items = Array.from(overlay.querySelectorAll('.Menu [gd-menu-item]'));
            const levelOneTrigger = overlay.querySelector('#level-one-trigger');

            dispatchMouseEvent(levelOneTrigger, 'mouseenter');
            fixture.detectChanges();
            tick();
            expect(overlay.querySelectorAll('.Menu').length).toBe(2, 'Expected two open menus');

            dispatchMouseEvent(items[items.indexOf(levelOneTrigger) + 1], 'mouseenter');
            fixture.detectChanges();
            tick(500);

            expect(document.activeElement)
                .not.toBe(levelOneTrigger, 'Expected focus not to be returned to the initial trigger.');
        }));

    });

});


@Component({
    template: `
        <button [gdMenuTrigger]="menu" #triggerEl>Toggle menu</button>
        <gd-menu
            #menu="gdMenu"
            class="custom-one custom-two"
            (closed)="closeCallback($event)">
            <button gd-menu-item> Item</button>
            <button gd-menu-item disabled> Disabled</button>
            <button gd-menu-item>
                Item with an icon
            </button>
            <button *ngFor="let item of extraItems" gd-menu-item>{{item}}</button>
        </gd-menu>
    `,
})
class SimpleMenuComponent {
    @ViewChild(MenuTriggerDirective) trigger: MenuTriggerDirective;
    @ViewChild('triggerEl') triggerEl: ElementRef<HTMLElement>;
    @ViewChild(MenuComponent) menu: MenuComponent;
    @ViewChildren(MenuItemComponent) items: QueryList<MenuItemComponent>;
    extraItems: string[] = [];
    closeCallback = jasmine.createSpy('menu closed callback');
}


@Component({
    template: `
        <button
            [gdMenuTrigger]="root"
            #rootTrigger="gdMenuTrigger"
            #rootTriggerEl>
            Toggle menu
        </button>
        <button
            [gdMenuTrigger]="levelTwo"
            #alternateTrigger="gdMenuTrigger">
            Toggle alternate menu
        </button>
        <gd-menu #root="gdMenu" (closed)="rootCloseCallback($event)">
            <button gd-menu-item
                    id="level-one-trigger"
                    [gdMenuTrigger]="levelOne"
                    #levelOneTrigger="gdMenuTrigger">
                One
            </button>
            <button gd-menu-item>Two</button>
        </gd-menu>
        <gd-menu #levelOne="gdMenu" (closed)="levelOneCloseCallback($event)">
            <button gd-menu-item>Four</button>
            <button gd-menu-item
                    id="level-two-trigger"
                    [gdMenuTrigger]="levelTwo"
                    #levelTwoTrigger="gdMenuTrigger">
                Five
            </button>
            <button gd-menu-item>Six</button>
        </gd-menu>
        <gd-menu #levelTwo="gdMenu" (closed)="levelTwoCloseCallback($event)">
            <button gd-menu-item>Seven</button>
            <button gd-menu-item>Eight</button>
            <button gd-menu-item>Nine</button>
        </gd-menu>
    `,
})
class NestedMenuComponent {
    @ViewChild('root') rootMenu: MenuComponent;
    @ViewChild('rootTrigger') rootTrigger: MenuTriggerDirective;
    @ViewChild('rootTriggerEl') rootTriggerEl: ElementRef<HTMLElement>;
    @ViewChild('alternateTrigger') alternateTrigger: MenuTriggerDirective;
    readonly rootCloseCallback = jasmine.createSpy('root menu closed callback');

    @ViewChild('levelOne') levelOneMenu: MenuComponent;
    @ViewChild('levelOneTrigger') levelOneTrigger: MenuTriggerDirective;
    readonly levelOneCloseCallback = jasmine.createSpy('level one menu closed callback');

    @ViewChild('levelTwo') levelTwoMenu: MenuComponent;
    @ViewChild('levelTwoTrigger') levelTwoTrigger: MenuTriggerDirective;
    readonly levelTwoCloseCallback = jasmine.createSpy('level one menu closed callback');
}
