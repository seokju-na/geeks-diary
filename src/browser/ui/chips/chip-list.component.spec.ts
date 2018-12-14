/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { FocusKeyManager } from '@angular/cdk/a11y';
import { BACKSPACE, DELETE, ENTER, SPACE } from '@angular/cdk/keycodes';
import { Component, DebugElement, NgZone, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import {
    createKeyboardEvent,
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    fastTestSetup,
    typeInElement,
} from '../../../../test/helpers';
import { MockNgZone } from '../../../../test/mocks/browser';
import { FormFieldModule } from '../form-field';
import { ChipDirective } from './chip';
import { ChipInputEvent } from './chip-input.directive';
import { ChipListComponent } from './chip-list.component';
import { ChipsModule } from './chips.module';


describe('browser.ui.chips.ChipListComponent', () => {
    let fixture: ComponentFixture<InputChipListComponent>;
    let chipListDebugElement: DebugElement;
    let chipListNativeElement: HTMLElement;
    let chipListInstance: ChipListComponent;
    let chips: QueryList<ChipDirective>;
    let manager: FocusKeyManager<ChipDirective>;
    let zone: MockNgZone;

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                imports: [
                    ReactiveFormsModule,
                    ChipsModule,
                    FormFieldModule,
                ],
                declarations: [InputChipListComponent],
                providers: [
                    { provide: NgZone, useFactory: () => zone = new MockNgZone() },
                ],
            })
            .compileComponents();
    });

    describe('chip list with chip input', () => {
        let nativeChips: HTMLElement[];

        beforeEach(() => {
            fixture = TestBed.createComponent(InputChipListComponent);
            fixture.detectChanges();

            nativeChips = fixture.debugElement
                .queryAll(By.css('gd-chip'))
                .map((chip) => chip.nativeElement);

            chipListDebugElement = fixture.debugElement.query(By.directive(ChipListComponent));
            chipListNativeElement = chipListDebugElement.nativeElement;
            chipListInstance = chipListDebugElement.componentInstance;
            chips = chipListInstance.chips;
        });

        it('should take an initial view value with reactive forms', () => {
            fixture.componentInstance.control = new FormControl(['pizza-1']);
            fixture.detectChanges();

            const array = fixture.componentInstance.chips.toArray();

            expect(array[1].selected).toBeTruthy('Expect pizza-1 chip to be selected');

            dispatchKeyboardEvent(nativeChips[1], 'keydown', SPACE);
            fixture.detectChanges();

            expect(array[1].selected).toBeFalsy('Expect chip to be not selected after toggle selected');
        });

        it('should set the view value from the form', () => {
            const array = fixture.componentInstance.chips.toArray();

            expect(array[1].selected).toBeFalsy('Expect chip to not be selected');

            fixture.componentInstance.control.setValue(['pizza-1']);
            fixture.detectChanges();

            expect(array[1].selected).toBeTruthy('Expect chip to be selected');
        });

        it('should update the form value when the view changes', () => {

            expect(fixture.componentInstance.control.value)
                .toEqual(null, `Expected the control's value to be empty initially.`);

            dispatchKeyboardEvent(nativeChips[0], 'keydown', SPACE);
            fixture.detectChanges();

            expect(fixture.componentInstance.control.value)
                .toEqual(['steak-0'], `Expected control's value to be set to the new option.`);
        });

        it('should clear the selection when a nonexistent option value is selected', () => {
            const array = fixture.componentInstance.chips.toArray();

            fixture.componentInstance.control.setValue(['pizza-1']);
            fixture.detectChanges();

            expect(array[1].selected)
                .toBeTruthy(`Expected chip with the value to be selected.`);

            fixture.componentInstance.control.setValue(['gibberish']);

            fixture.detectChanges();

            expect(array[1].selected)
                .toBeFalsy(`Expected chip with the old value not to be selected.`);
        });


        it('should clear the selection when the control is reset', () => {
            const array = fixture.componentInstance.chips.toArray();

            fixture.componentInstance.control.setValue(['pizza-1']);
            fixture.detectChanges();

            fixture.componentInstance.control.reset();
            fixture.detectChanges();

            expect(array[1].selected)
                .toBeFalsy(`Expected chip with the old value not to be selected.`);
        });

        it('should set the control to touched when the chip list is touched', fakeAsync(() => {
            expect(fixture.componentInstance.control.touched)
                .toBe(false, 'Expected the control to start off as untouched.');

            const nativeChipList = fixture.debugElement.query(By.css('.ChipList')).nativeElement;

            dispatchFakeEvent(nativeChipList, 'blur');
            tick();

            expect(fixture.componentInstance.control.touched)
                .toBe(true, 'Expected the control to be touched.');
        }));

        it('should not set touched when a disabled chip list is touched', () => {
            expect(fixture.componentInstance.control.touched)
                .toBe(false, 'Expected the control to start off as untouched.');

            fixture.componentInstance.control.disable();
            const nativeChipList = fixture.debugElement.query(By.css('.ChipList')).nativeElement;
            dispatchFakeEvent(nativeChipList, 'blur');

            expect(fixture.componentInstance.control.touched)
                .toBe(false, 'Expected the control to stay untouched.');
        });

        it('should set the control to dirty when the chip list\'s value changes in the DOM', () => {
            expect(fixture.componentInstance.control.dirty)
                .toEqual(false, `Expected control to start out pristine.`);

            dispatchKeyboardEvent(nativeChips[1], 'keydown', SPACE);
            fixture.detectChanges();

            expect(fixture.componentInstance.control.dirty)
                .toEqual(true, `Expected control to be dirty after value was changed by user.`);
        });

        it('should not set the control to dirty when the value changes programmatically', () => {
            expect(fixture.componentInstance.control.dirty)
                .toEqual(false, `Expected control to start out pristine.`);

            fixture.componentInstance.control.setValue(['pizza-1']);

            expect(fixture.componentInstance.control.dirty)
                .toEqual(false, `Expected control to stay pristine after programmatic change.`);
        });

        it('should keep focus on the input after adding the first chip', fakeAsync(() => {
            const nativeInput = fixture.nativeElement.querySelector('input');
            const chipEls = Array.from<HTMLElement>(
                fixture.nativeElement.querySelectorAll('.Chip')).reverse();

            // Remove the chips via backspace to simulate the user removing them.
            chipEls.forEach(chip => {
                chip.focus();
                dispatchKeyboardEvent(chip, 'keydown', BACKSPACE);
                fixture.detectChanges();
                tick();
            });

            nativeInput.focus();
            expect(fixture.componentInstance.foods).toEqual([], 'Expected all chips to be removed.');
            expect(document.activeElement).toBe(nativeInput, 'Expected input to be focused.');

            typeInElement('123', nativeInput);
            fixture.detectChanges();
            dispatchKeyboardEvent(nativeInput, 'keydown', ENTER);
            fixture.detectChanges();
            tick();

            expect(document.activeElement).toBe(nativeInput, 'Expected input to remain focused.');
        }));

        describe('keyboard behavior', () => {
            beforeEach(() => {
                chipListDebugElement = fixture.debugElement.query(By.directive(ChipListComponent));
                chipListInstance = chipListDebugElement.componentInstance;
                chips = chipListInstance.chips;
                manager = fixture.componentInstance.chipList._keyManager;
            });

            describe('when the input has focus', () => {

                it('should not focus the last chip when press DELETE', () => {
                    const nativeInput = fixture.nativeElement.querySelector('input');
                    const DELETE_EVENT: KeyboardEvent = createKeyboardEvent('keydown', DELETE, nativeInput);

                    // Focus the input
                    nativeInput.focus();
                    expect(manager.activeItemIndex).toBe(-1);

                    // Press the DELETE key
                    chipListInstance._keydown(DELETE_EVENT);
                    fixture.detectChanges();

                    // It doesn't focus the last chip
                    expect(manager.activeItemIndex).toEqual(-1);
                });

                it('should focus the last chip when press BACKSPACE', () => {
                    const nativeInput = fixture.nativeElement.querySelector('input');
                    const BACKSPACE_EVENT: KeyboardEvent =
                        createKeyboardEvent('keydown', BACKSPACE, nativeInput);

                    // Focus the input
                    nativeInput.focus();
                    expect(manager.activeItemIndex).toBe(-1);

                    // Press the BACKSPACE key
                    chipListInstance._keydown(BACKSPACE_EVENT);
                    fixture.detectChanges();

                    // It focuses the last chip
                    expect(manager.activeItemIndex).toEqual(chips.length - 1);
                });
            });
        });
    });
});


@Component({
    template: `
        <gd-form-field>
            <gd-chip-list [multiple]="true" [formControl]="control" [required]="isRequired" #chipList>
                <gd-chip *ngFor="let food of foods" [value]="food.value" (removed)="remove(food)">
                    {{ food.viewValue }}
                </gd-chip>
            </gd-chip-list>
            <input placeholder="New food..."
                   [gdChipInputFor]="chipList"
                   [gdChipInputSeparatorKeyCodes]="separatorKeyCodes"
                   [gdChipInputAddOnBlur]="addOnBlur"
                   (gdChipInputTokenEnd)="add($event)"/>
        </gd-form-field>
    `,
})
class InputChipListComponent {
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: 'tacos-2', viewValue: 'Tacos', disabled: true },
        { value: 'sandwich-3', viewValue: 'Sandwich' },
        { value: 'chips-4', viewValue: 'Chips' },
        { value: 'eggs-5', viewValue: 'Eggs' },
        { value: 'pasta-6', viewValue: 'Pasta' },
        { value: 'sushi-7', viewValue: 'Sushi' },
    ];
    control = new FormControl();

    separatorKeyCodes = [ENTER, SPACE];
    addOnBlur: boolean = true;
    isRequired: boolean;
    @ViewChild(ChipListComponent) chipList: ChipListComponent;
    @ViewChildren(ChipDirective) chips: QueryList<ChipDirective>;

    add(event: ChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        // Add our foods
        if ((value || '').trim()) {
            this.foods.push({
                value: `${value.trim().toLowerCase()}-${this.foods.length}`,
                viewValue: value.trim(),
            });
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
    }

    remove(food: any): void {
        const index = this.foods.indexOf(food);

        if (index > -1) {
            this.foods.splice(index, 1);
        }
    }
}
