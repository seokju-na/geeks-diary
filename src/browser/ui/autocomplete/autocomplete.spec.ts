/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOWN_ARROW, ENTER, ESCAPE, UP_ARROW } from '@angular/cdk/keycodes';
import { OverlayContainer } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { Component, NgModule, NgZone, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Type } from '@angular/core/src/type';
import { async, ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import {
    createKeyboardEvent,
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    expectDom,
    fastTestSetup,
    typeInElement,
} from '../../../../test/helpers';
import { MockNgZone } from '../../../../test/mocks/browser';
import { FormFieldModule } from '../form-field';
import { InputModule } from '../input';
import { AutocompleteItemComponent } from './autocomplete-item.component';
import {
    AUTOCOMPLETE_ITEM_HEIGHT,
    AUTOCOMPLETE_PANEL_HEIGHT,
    AutocompleteTriggerDirective,
} from './autocomplete-trigger.directive';
import { AutocompleteComponent } from './autocomplete.component';
import { AutocompleteModule } from './autocomplete.module';


describe('browser.ui.autocomplete', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerEl: HTMLElement;
    let zone: MockNgZone;

    function createFixture<T>(component: Type<T>): ComponentFixture<T> {
        const fixture = TestBed.createComponent(component);
        fixture.detectChanges();
        return fixture;
    }

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                imports: [TestAutocompleteModule],
                providers: [...MockNgZone.providers()],
            })
            .compileComponents();
    });

    beforeEach(() => {
        overlayContainer = TestBed.get(OverlayContainer);
        overlayContainerEl = overlayContainer.getContainerElement();
        zone = TestBed.get(NgZone);
    });

    afterEach(() => {
        overlayContainer.ngOnDestroy();
    });

    describe('panel toggling', () => {
        let fixture: ComponentFixture<SimpleAutocompleteComponent>;
        let inputEl: HTMLInputElement;

        beforeEach(() => {
            fixture = createFixture<SimpleAutocompleteComponent>(SimpleAutocompleteComponent);
            inputEl = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
        });

        it('should open the panel when the input is focused.', () => {
            expect(fixture.componentInstance.trigger.panelOpen)
                .toBe(false, `Expected panel state to start out closed.`);

            dispatchFakeEvent(inputEl, 'focusin');
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger.panelOpen).toBe(true);
            expectDom(overlayContainerEl).toContainText('Alabama');
            expectDom(overlayContainerEl).toContainText('California');
        });

        it('should not open the panel on focus if the input is readonly.', fakeAsync(() => {
            const trigger = fixture.componentInstance.trigger;
            inputEl.readOnly = true;
            fixture.detectChanges();

            expect(trigger.panelOpen).toBe(false, 'Expected panel state to start out closed.');
            dispatchFakeEvent(inputEl, 'focusin');
            flush();

            fixture.detectChanges();
            expect(trigger.panelOpen).toBe(false, 'Expected panel to stay closed.');
        }));

        it('should not open using the arrow keys when the input is readonly', fakeAsync(() => {
            const trigger = fixture.componentInstance.trigger;
            inputEl.readOnly = true;
            fixture.detectChanges();

            expect(trigger.panelOpen).toBe(false, 'Expected panel state to start out closed.');
            dispatchKeyboardEvent(inputEl, 'keydown', DOWN_ARROW);
            flush();

            fixture.detectChanges();
            expect(trigger.panelOpen).toBe(false, 'Expected panel to stay closed.');
        }));

        it('should show the panel when the first open is after the initial zone stabilization.', async(() => {
            // Note that we're running outside the Angular zone, in order to be able
            // to test properly without the subscription from `_subscribeToClosingActions`
            // giving us a false positive.
            fixture.ngZone.runOutsideAngular(() => {
                fixture.componentInstance.trigger.openPanel();

                Promise.resolve().then(() => {
                    expect(fixture.componentInstance.panel.showPanel)
                        .toBe(true, `Expected panel to be visible.`);
                });
            });
        }));

        it('should close the panel when the user clicks away.', fakeAsync(() => {
            dispatchFakeEvent(inputEl, 'focusin');
            fixture.detectChanges();
            zone.simulateZoneExit();
            dispatchFakeEvent(document, 'click');

            expect(fixture.componentInstance.trigger.panelOpen)
                .toBe(false, `Expected clicking outside the panel to set its state to closed.`);
            expect(overlayContainerEl.textContent)
                .toEqual('', `Expected clicking outside the panel to close the panel.`);
        }));

        it('should close the panel when an item is clicked.', fakeAsync(() => {
            dispatchFakeEvent(inputEl, 'focusin');
            fixture.detectChanges();
            zone.simulateZoneExit();

            const item = overlayContainerEl.querySelector('gd-autocomplete-item') as HTMLElement;
            item.click();
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger.panelOpen)
                .toBe(false, `Expected clicking an option to set the panel state to closed.`);
            expect(overlayContainerEl.textContent)
                .toEqual('', `Expected clicking an option to close the panel.`);
        }));

        it('should close the panel when a newly created item is clicked', fakeAsync(() => {
            dispatchFakeEvent(inputEl, 'focusin');
            fixture.detectChanges();
            zone.simulateZoneExit();

            // Filter down the option list to a subset of original items ('Alabama', 'California')
            typeInElement('al', inputEl);
            fixture.detectChanges();
            tick();

            let items =
                overlayContainerEl.querySelectorAll('gd-autocomplete-item') as NodeListOf<HTMLElement>;
            items[0].click();

            // Changing value from 'Alabama' to 'al' to re-populate the option list,
            // ensuring that 'California' is created new.
            dispatchFakeEvent(inputEl, 'focusin');
            zone.simulateZoneExit();

            typeInElement('al', inputEl);
            fixture.detectChanges();
            tick();

            items = overlayContainerEl.querySelectorAll('gd-autocomplete-item') as NodeListOf<HTMLElement>;
            items[1].click();
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger.panelOpen)
                .toBe(false, `Expected clicking a new option to set the panel state to closed.`);
            expect(overlayContainerEl.textContent)
                .toEqual('', `Expected clicking a new option to close the panel.`);
        }));

        it('should hide the panel when the items list is empty.', fakeAsync(() => {
            dispatchFakeEvent(inputEl, 'focusin');
            fixture.detectChanges();
            zone.simulateZoneExit();

            const panel = overlayContainerEl.querySelector('.Autocomplete__panel') as HTMLElement;

            expect(panel.classList.contains('Autocomplete__panel--visible')).toBe(true);

            // Filter down the option list such that no options match the value
            typeInElement('af', inputEl);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(panel.classList.contains('Autocomplete__panel--hidden')).toBe(true);
        }));

        it('should not be able to open the panel if the autocomplete is disabled', () => {
            expect(fixture.componentInstance.trigger.panelOpen).toBe(false);

            fixture.componentInstance.autocompleteDisabled = true;
            fixture.detectChanges();

            dispatchFakeEvent(inputEl, 'focusin');
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger.panelOpen).toBe(false);
        });
    });

    describe('form integrations', () => {
        let fixture: ComponentFixture<SimpleAutocompleteComponent>;
        let inputEl: HTMLInputElement;

        beforeEach(() => {
            fixture = createFixture<SimpleAutocompleteComponent>(SimpleAutocompleteComponent);
            inputEl = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
        });

        it('should update control value as user types with input value.', () => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();

            typeInElement('a', inputEl);
            fixture.detectChanges();

            expect(fixture.componentInstance.control.value).toEqual('a');

            typeInElement('al', inputEl);
            fixture.detectChanges();

            expect(fixture.componentInstance.control.value).toEqual('al');
        });

        it('should update control value when item is selected with item value.', fakeAsync(() => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();

            const items =
                overlayContainerEl.querySelectorAll('gd-autocomplete-item') as NodeListOf<HTMLElement>;
            items[1].click();
            fixture.detectChanges();

            expect(fixture.componentInstance.control.value).toEqual({ code: 'CA', name: 'California' });
        }));

        it('should update the control back to a string if user types after an item is selected.',
            fakeAsync(() => {
                fixture.componentInstance.trigger.openPanel();
                fixture.detectChanges();
                zone.simulateZoneExit();

                const items =
                    overlayContainerEl.querySelectorAll('gd-autocomplete-item') as NodeListOf<HTMLElement>;
                items[1].click();
                fixture.detectChanges();

                typeInElement('Californi', inputEl);
                fixture.detectChanges();
                tick();

                expect(fixture.componentInstance.control.value).toEqual('Californi');
            }));

        it('should fill the text field with display value when an item is selected.', fakeAsync(() => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();

            const items =
                overlayContainerEl.querySelectorAll('gd-autocomplete-item') as NodeListOf<HTMLElement>;
            items[1].click();
            fixture.detectChanges();

            expect(inputEl.value).toContain('California');
        }));

        it('should fill the text field with value if displayWith is not set', fakeAsync(() => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();

            fixture.componentInstance.panel.displayWith = null;
            fixture.componentInstance.options.toArray()[1].value = 'test value';
            fixture.detectChanges();

            const items =
                overlayContainerEl.querySelectorAll('gd-autocomplete-item') as NodeListOf<HTMLElement>;
            items[1].click();

            fixture.detectChanges();
            expect(inputEl.value).toContain('test value');
        }));

        it('should fill the text field correctly if value is set to obj programmatically.',
            fakeAsync(() => {
                fixture.componentInstance.control.setValue({code: 'AL', name: 'Alabama'});
                fixture.detectChanges();
                tick();
                fixture.detectChanges();

                expect(inputEl.value).toContain('Alabama');
            }));

        it('should clear the text field if value is reset programmatically.', fakeAsync(() => {
            typeInElement('Alabama', inputEl);
            fixture.detectChanges();
            tick();

            fixture.componentInstance.control.reset();
            tick();

            fixture.detectChanges();
            tick();

            expect(inputEl.value).toEqual('');
        }));

        it('should disable input in view when disabled programmatically', () => {
            expect(inputEl.disabled).toBe(false);

            fixture.componentInstance.control.disable();
            fixture.detectChanges();

            expect(inputEl.disabled).toBe(true);
        });

        it('should mark the autocomplete control as dirty as user types.', () => {
            expect(fixture.componentInstance.control.dirty).toBe(false);

            typeInElement('a', inputEl);
            fixture.detectChanges();

            expect(fixture.componentInstance.control.dirty).toBe(true);
        });

        it('should mark the autocomplete control as dirty when an item is selected', fakeAsync(() => {
            expect(fixture.componentInstance.control.dirty).toBe(false);

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();

            const items =
                overlayContainerEl.querySelectorAll('gd-autocomplete-item') as NodeListOf<HTMLElement>;
            items[1].click();
            fixture.detectChanges();

            expect(fixture.componentInstance.control.dirty).toBe(true);
        }));
    });

    describe('keyboard events', () => {
        let fixture: ComponentFixture<SimpleAutocompleteComponent>;
        let inputEl: HTMLInputElement;
        let DOWN_ARROW_EVENT: KeyboardEvent;
        let UP_ARROW_EVENT: KeyboardEvent;
        let ENTER_EVENT: KeyboardEvent;

        beforeEach(fakeAsync(() => {
            fixture = createFixture<SimpleAutocompleteComponent>(SimpleAutocompleteComponent);
            fixture.detectChanges();

            inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
            DOWN_ARROW_EVENT = createKeyboardEvent('keydown', DOWN_ARROW);
            UP_ARROW_EVENT = createKeyboardEvent('keydown', UP_ARROW);
            ENTER_EVENT = createKeyboardEvent('keydown', ENTER);

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();
        }));

        it('should not focus the item when DOWN key is pressed.', () => {
            spyOn(fixture.componentInstance.options.first, 'focus');

            fixture.componentInstance.trigger._handleKeyDown(DOWN_ARROW_EVENT);
            expect(fixture.componentInstance.options.first.focus).not.toHaveBeenCalled();
        });

        it('should not close the panel when DOWN key is pressed.', () => {
            fixture.componentInstance.trigger._handleKeyDown(DOWN_ARROW_EVENT);

            expect(fixture.componentInstance.trigger.panelOpen)
                .toBe(true, `Expected panel state to stay open when DOWN key is pressed.`);
            expect(overlayContainerEl.textContent)
                .toContain('Alabama', `Expected panel to keep displaying when DOWN key is pressed.`);
            expect(overlayContainerEl.textContent)
                .toContain('California', `Expected panel to keep displaying when DOWN key is pressed.`);
        });

        it('should set the active item to the first option when DOWN key is pressed.', () => {
            const componentInstance = fixture.componentInstance;
            const itemEls =
                overlayContainerEl.querySelectorAll('gd-autocomplete-item') as NodeListOf<HTMLElement>;

            expect(componentInstance.trigger.panelOpen)
                .toBe(true, 'Expected first down press to open the pane.');

            componentInstance.trigger._handleKeyDown(DOWN_ARROW_EVENT);
            fixture.detectChanges();

            expect(componentInstance.trigger.activeItem === componentInstance.options.first)
                .toBe(true, 'Expected first option to be active.');
            expect(itemEls[0].classList).toContain('AutocompleteItem--active');
            expect(itemEls[1].classList).not.toContain('AutocompleteItem--active');

            componentInstance.trigger._handleKeyDown(DOWN_ARROW_EVENT);
            fixture.detectChanges();

            expect(componentInstance.trigger.activeItem === componentInstance.options.toArray()[1])
                .toBe(true, 'Expected second option to be active.');
            expect(itemEls[0].classList).not.toContain('AutocompleteItem--active');
            expect(itemEls[1].classList).toContain('AutocompleteItem--active');
        });

        it('should set the active item to the last option when UP key is pressed.', () => {
            const componentInstance = fixture.componentInstance;
            const itemEls =
                overlayContainerEl.querySelectorAll('gd-autocomplete-item') as NodeListOf<HTMLElement>;

            expect(componentInstance.trigger.panelOpen)
                .toBe(true, 'Expected first up press to open the pane.');

            componentInstance.trigger._handleKeyDown(UP_ARROW_EVENT);
            fixture.detectChanges();

            expect(componentInstance.trigger.activeItem === componentInstance.options.last)
                .toBe(true, 'Expected last option to be active.');
            expect(itemEls[20].classList).toContain('AutocompleteItem--active');
            expect(itemEls[0].classList).not.toContain('AutocompleteItem--active');

            componentInstance.trigger._handleKeyDown(DOWN_ARROW_EVENT);
            fixture.detectChanges();

            expect(componentInstance.trigger.activeItem === componentInstance.options.first)
                .toBe(true, 'Expected first option to be active.');
            expect(itemEls[0].classList).toContain('AutocompleteItem--active');
        });

        it('should set the active item properly after filtering.', fakeAsync(() => {
            const componentInstance = fixture.componentInstance;

            componentInstance.trigger._handleKeyDown(DOWN_ARROW_EVENT);
            tick();
            fixture.detectChanges();
        }));

        it('should close the panel when pressing escape.', fakeAsync(() => {
            const trigger = fixture.componentInstance.trigger;

            inputEl.focus();
            flush();
            fixture.detectChanges();

            expect(document.activeElement).toBe(inputEl, 'Expected input to be focused.');
            expect(trigger.panelOpen).toBe(true, 'Expected panel to be open.');

            dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
            fixture.detectChanges();

            expect(document.activeElement).toBe(inputEl, 'Expected input to continue to be focused.');
            expect(trigger.panelOpen).toBe(false, 'Expected panel to be closed.');
        }));

        it('should scroll to active items below the fold', () => {
            const trigger = fixture.componentInstance.trigger;
            const scrollContainer = document.querySelector('.cdk-overlay-pane .Autocomplete__panel');

            trigger._handleKeyDown(DOWN_ARROW_EVENT);
            fixture.detectChanges();
            expect(scrollContainer.scrollTop).toEqual(0, `Expected panel not to scroll.`);

            // These down arrows will set the 12th option active, below the fold.
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].forEach(() => trigger._handleKeyDown(DOWN_ARROW_EVENT));

            // Expect option bottom minus the panel height (288 - 256 = 32)
            const expected = 12 * AUTOCOMPLETE_ITEM_HEIGHT - AUTOCOMPLETE_PANEL_HEIGHT;

            expect(scrollContainer.scrollTop).toEqual(expected, `Expected panel to reveal the ten item.`);
        });

        it('should scroll to active items on UP arrow', () => {
            const scrollContainer = document.querySelector('.cdk-overlay-pane .Autocomplete__panel');

            fixture.componentInstance.trigger._handleKeyDown(UP_ARROW_EVENT);
            fixture.detectChanges();

            // Expect option bottom minus the panel height (24 * 21 - 256 = 248)
            expect(scrollContainer.scrollTop).toEqual(248, `Expected panel to reveal last option.`);
        });
    });
});


@Component({
    template: `
        <gd-form-field>
            <input gdInput [gdAutocompleteTrigger]="auto" [gdAutocompleteDisabled]="autocompleteDisabled"
                   [formControl]="control">
        </gd-form-field>

        <gd-autocomplete #auto="gdAutocomplete" [displayWith]="displayFn">
            <gd-autocomplete-item *ngFor="let state of filteredStates" [value]="state">
                <span>{{ state.code }}: {{ state.name }}</span>
            </gd-autocomplete-item>
        </gd-autocomplete>
    `,
})
class SimpleAutocompleteComponent implements OnDestroy {
    control = new FormControl();
    filteredStates: any[];
    valueSub: Subscription;
    autocompleteDisabled = false;

    @ViewChild(AutocompleteTriggerDirective) trigger: AutocompleteTriggerDirective;
    @ViewChild(AutocompleteComponent) panel: AutocompleteComponent;
    @ViewChildren(AutocompleteItemComponent) options: QueryList<AutocompleteItemComponent>;

    states = [
        { code: 'AL', name: 'Alabama' },
        { code: 'CA', name: 'California' },
        { code: 'FL', name: 'Florida' },
        { code: 'KS', name: 'Kansas' },
        { code: 'MA', name: 'Massachusetts' },
        { code: 'NY', name: 'New York' },
        { code: 'OR', name: 'Oregon' },
        { code: 'PA', name: 'Pennsylvania' },
        { code: 'TN', name: 'Tennessee' },
        { code: 'VA', name: 'Virginia' },
        { code: 'WY', name: 'Wyoming' },
        { code: 'OO', name: 'Oooo' },
        { code: 'PP', name: 'Pppp' },
        { code: 'QQ', name: 'Qqqq' },
        { code: 'BB', name: 'Bbbb' },
        { code: 'CC', name: 'Cccc' },
        { code: 'II', name: 'Iiii' },
        { code: 'UU', name: 'Uuuu' },
        { code: 'ZZ', name: 'Zzzz' },
        { code: 'Nm', name: 'Nmmm' },
        { code: '11', name: '1111' },
    ];

    constructor() {
        this.filteredStates = this.states;
        this.valueSub = this.control.valueChanges.subscribe(val => {
            this.filteredStates = val
                ? this.states.filter(s => s.name.match(new RegExp(val, 'gi')))
                : this.states;
        });
    }

    displayFn(value: any): string {
        return value ? value.name : value;
    }

    ngOnDestroy(): void {
        this.valueSub.unsubscribe();
    }
}


@NgModule({
    imports: [
        CommonModule,
        AutocompleteModule,
        FormFieldModule,
        InputModule,
        ReactiveFormsModule,
    ],
    declarations: [
        SimpleAutocompleteComponent,
    ],
    exports: [
        SimpleAutocompleteComponent,
    ],
})
class TestAutocompleteModule {
}
