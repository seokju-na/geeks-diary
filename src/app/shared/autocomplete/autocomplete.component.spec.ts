/**
 * This is hard replica of material2's autocomplete.
 * All source are from google's material2 project.
 * See https://github.com/angular/material2/tree/master/src/lib/autocomplete.
 */
import { OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { Component, NgZone, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, inject, TestBed, tick } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subscription } from 'rxjs/Subscription';
import { KeyCodes } from '../../../common/key-codes';
import { dispatchFakeEvent, dispatchKeyboardEvent, MockNgZone, typeInElement } from '../../../testing';
import { FormFieldControlDirective } from '../form-field/form-field-control.directive';
import { FormFieldComponent } from '../form-field/form-field.component';
import { OptionItemComponent } from '../option-item/option-item.component';
import { AutocompleteTriggerDirective } from './autocomplete-trigger.directive';
import { AutocompleteComponent } from './autocomplete.component';


describe('app.shared.autocomplete', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    let fixture: ComponentFixture<TestAutocompleteComponent>;
    let inputElem: HTMLInputElement;
    let zone: MockNgZone;

    beforeEach(async(() => {
        // noinspection JSUnusedGlobalSymbols
        TestBed
            .configureTestingModule({
                imports: [
                    CommonModule,
                    ReactiveFormsModule,
                    NoopAnimationsModule,
                    OverlayModule
                ],
                declarations: [
                    FormFieldComponent,
                    FormFieldControlDirective,
                    OptionItemComponent,
                    AutocompleteTriggerDirective,
                    AutocompleteComponent,
                    TestAutocompleteComponent
                ],
                providers: [
                    { provide: NgZone, useFactory: () => new MockNgZone() }
                ]
            })
            .compileComponents();
    }));

    beforeEach(inject([OverlayContainer, NgZone], (o: OverlayContainer, z: MockNgZone) => {
        overlayContainer = o;
        zone = z;

        overlayContainerElement = overlayContainer.getContainerElement();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TestAutocompleteComponent);
        fixture.detectChanges();

        inputElem = fixture.debugElement.query(By.css('input')).nativeElement;
    });

    afterEach(inject([OverlayContainer], (currentOverlayContainer: OverlayContainer) => {
        // Since we're resetting the testing module in some of the tests,
        // we can potentially have multiple overlay containers.
        currentOverlayContainer.ngOnDestroy();
        overlayContainer.ngOnDestroy();
    }));

    it('should open the panel when the input is focused', () => {
        expect(fixture.componentInstance.trigger.panelOpen).toBeFalsy();

        dispatchFakeEvent(inputElem, 'focusin');
        fixture.detectChanges();

        expect(fixture.componentInstance.trigger.panelOpen).toBeTruthy();
        expect(overlayContainerElement.textContent).toContain('Alabama');
        expect(overlayContainerElement.textContent).toContain('California');
    });

    it('should open the panel programmatically', () => {
        expect(fixture.componentInstance.trigger.panelOpen).toBeFalsy();

        fixture.componentInstance.trigger.openPanel();
        fixture.detectChanges();

        expect(fixture.componentInstance.trigger.panelOpen).toBeTruthy();
        expect(overlayContainerElement.textContent).toContain('Alabama');
        expect(overlayContainerElement.textContent).toContain('California');
    });

    it('should close the panel when the user clicks away', fakeAsync(() => {
        dispatchFakeEvent(inputElem, 'focusin');
        fixture.detectChanges();
        zone.simulateZoneExit();
        dispatchFakeEvent(document, 'click');

        expect(fixture.componentInstance.trigger.panelOpen).toBeFalsy();
        expect(overlayContainerElement.textContent).toEqual('');
    }));

    it('should close the panel when an option is clicked', fakeAsync(() => {
        dispatchFakeEvent(inputElem, 'focusin');
        fixture.detectChanges();
        zone.simulateZoneExit();

        const option = overlayContainerElement.querySelector('.OptionItem') as HTMLElement;
        option.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.trigger.panelOpen).toBeFalsy();
        expect(overlayContainerElement.textContent).toEqual('');
    }));

    it('should hide the panel when the options list is empty', fakeAsync(() => {
        dispatchFakeEvent(inputElem, 'focusin');
        fixture.detectChanges();

        const panel = overlayContainerElement.querySelector('.Autocomplete') as HTMLElement;

        expect(panel.classList).toContain('Autocomplete--visible');

        // Filter down the option list such that no options match the value
        typeInElement('af', inputElem);
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        expect(panel.classList).toContain('Autocomplete--hidden');
    }));

    it('should not open the panel when the `input` event is invoked on a non-focused input', () => {
        expect(fixture.componentInstance.trigger.panelOpen).toBeFalsy();

        inputElem.value = 'Alabama';
        dispatchFakeEvent(inputElem, 'input');
        fixture.detectChanges();

        expect(fixture.componentInstance.trigger.panelOpen).toBeFalsy();
    });

    it('should toggle the visibility when typing and closing the panel', fakeAsync(() => {
        fixture.componentInstance.trigger.openPanel();
        tick();
        fixture.detectChanges();

        expect(overlayContainerElement.querySelector('.Autocomplete').classList)
            .toContain('Autocomplete--visible');

        typeInElement('x', inputElem);
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        expect(overlayContainerElement.querySelector('.Autocomplete').classList)
            .toContain('Autocomplete--hidden');

        fixture.componentInstance.trigger.closePanel();
        fixture.detectChanges();

        fixture.componentInstance.trigger.openPanel();
        fixture.detectChanges();

        typeInElement('al', inputElem);
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        expect(overlayContainerElement.querySelector('.Autocomplete').classList)
            .toContain('Autocomplete--visible');
    }));

    describe('keyboard events', () => {
        beforeEach(fakeAsync(() => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();
        }));

        it('should not focus the option when DOWN key is pressed', () => {
            spyOn(fixture.componentInstance.options.first, 'focus');

            dispatchKeyboardEvent(inputElem, 'keydown', KeyCodes.DOWN_ARROW);
            fixture.detectChanges();

            expect(fixture.componentInstance.options.first.focus).not.toHaveBeenCalled();
        });

        it('should set the active item to the first option when DOWN key is pressed', () => {
            const componentInstance = fixture.componentInstance;
            const optionEls =
                overlayContainerElement.querySelectorAll('.OptionItem') as NodeListOf<HTMLElement>;

            expect(componentInstance.trigger.panelOpen).toBeTruthy();

            dispatchKeyboardEvent(inputElem, 'keydown', KeyCodes.DOWN_ARROW);
            fixture.detectChanges();

            expect(optionEls[0].classList).toContain('OptionItem--active');
            expect(optionEls[1].classList).not.toContain('OptionItem--active');

            dispatchKeyboardEvent(inputElem, 'keydown', KeyCodes.DOWN_ARROW);
            fixture.detectChanges();

            expect(optionEls[0].classList).not.toContain('OptionItem--active');
            expect(optionEls[1].classList).toContain('OptionItem--active');
        });

        it('should set the active item properly after filtering', () => {
            typeInElement('o', inputElem);
            fixture.detectChanges();

            dispatchKeyboardEvent(inputElem, 'keydown', KeyCodes.DOWN_ARROW);
            fixture.detectChanges();

            const optionEls =
                overlayContainerElement.querySelectorAll('.OptionItem') as NodeListOf<HTMLElement>;

            expect(optionEls[0].classList).toContain('OptionItem--active');
            expect(optionEls[1].classList).not.toContain('OptionItem--active');
        });

        it('should fill the text field when an option is selected with ENTER', fakeAsync(() => {
            dispatchKeyboardEvent(inputElem, 'keydown', KeyCodes.DOWN_ARROW);
            flush();
            fixture.detectChanges();

            dispatchKeyboardEvent(inputElem, 'keydown', KeyCodes.ENTER);
            fixture.detectChanges();
            expect(inputElem.value).toContain('Alabama');
        }));

        it('should fill the text field, not select an option, when SPACE is entered', () => {
            typeInElement('New', inputElem);
            fixture.detectChanges();

            dispatchKeyboardEvent(inputElem, 'keydow', KeyCodes.SPACE);
            fixture.detectChanges();

            dispatchKeyboardEvent(inputElem, 'keydow', KeyCodes.SPACE);
            fixture.detectChanges();

            expect(inputElem.value).not.toContain('New York');
        });
    });
});


@Component({
    template: `
        <gd-form-field>
            <input gdFormFieldControl gdAutocomplete [autocomplete]="auto" [formControl]="stateCtrl">
            <gd-autocomplete [displayWith]="displayFn" #auto="gdAutocomplete">
                <gd-option-item *ngFor="let state of filteredStates" [value]="state">
                    <span>{{state.code}} {{state.name}}</span>
                </gd-option-item>
            </gd-autocomplete>
        </gd-form-field>
    `
})
class TestAutocompleteComponent implements OnDestroy {
    stateCtrl = new FormControl();
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
        { code: 'WY', name: 'Wyoming' }
    ];
    filteredStates: any[] = [];
    valueChangeSubscription: Subscription;

    @ViewChild(AutocompleteTriggerDirective) trigger: AutocompleteTriggerDirective;
    @ViewChildren(OptionItemComponent) options: QueryList<OptionItemComponent>;

    constructor() {
        this.filteredStates = this.states;
        this.valueChangeSubscription = this.stateCtrl.valueChanges.subscribe((val) => {
            this.filteredStates = val
                ? this.states.filter((s) => s.name.match(new RegExp(val, 'gi')))
                : this.states;
        });
    }

    ngOnDestroy(): void {
        this.valueChangeSubscription.unsubscribe();
    }

    displayFn(value: any): string {
        if (value && value.name) {
            return value.name
        }

        return '';
    }
}
