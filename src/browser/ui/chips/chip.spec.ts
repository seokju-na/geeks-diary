/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { BACKSPACE, DELETE, SPACE } from '@angular/cdk/keycodes';
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { createKeyboardEvent, dispatchFakeEvent, fastTestSetup } from '../../../../test/helpers';
import { ChipDirective, ChipEvent, ChipSelectionChange } from './chip';
import { ChipsModule } from './chips.module';


describe('browser.ui.chips.chip', () => {
    let fixture: ComponentFixture<SingleChipComponent>;
    let chipDebugElement: DebugElement;
    let chipNativeElement: HTMLElement;
    let chipInstance: ChipDirective;

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                imports: [ChipsModule],
                declarations: [SingleChipComponent],
            })
            .compileComponents();
    });

    let testComponent: SingleChipComponent;

    beforeEach(() => {
        fixture = TestBed.createComponent(SingleChipComponent);
        fixture.detectChanges();

        chipDebugElement = fixture.debugElement.query(By.directive(ChipDirective));
        chipNativeElement = chipDebugElement.nativeElement;
        chipInstance = chipDebugElement.injector.get<ChipDirective>(ChipDirective);
        testComponent = fixture.debugElement.componentInstance;

        document.body.appendChild(chipNativeElement);
    });

    afterEach(() => {
        document.body.removeChild(chipNativeElement);
    });

    describe('basic behaviors', () => {
        it('does not add the `mat-basic-chip` class', () => {
            expect(chipNativeElement.classList).not.toContain('mat-basic-chip');
        });

        it('emits focus only once for multiple clicks', () => {
            let counter = 0;
            chipInstance._onFocus.subscribe(() => {
                counter++;
            });

            chipNativeElement.focus();
            chipNativeElement.focus();
            fixture.detectChanges();

            expect(counter).toBe(1);
        });

        it('emits destroy on destruction', () => {
            spyOn(testComponent, 'chipDestroy').and.callThrough();

            // Force a destroy callback
            testComponent.shouldShow = false;
            fixture.detectChanges();

            expect(testComponent.chipDestroy).toHaveBeenCalledTimes(1);
        });

        it('allows selection', () => {
            spyOn(testComponent, 'chipSelectionChange');
            expect(chipNativeElement.classList).not.toContain('Chip--selected');

            testComponent.selected = true;
            fixture.detectChanges();

            expect(chipNativeElement.classList).toContain('Chip--selected');
            expect(testComponent.chipSelectionChange)
                .toHaveBeenCalledWith({ source: chipInstance, isUserInput: false, selected: true });
        });

        it('allows removal', () => {
            spyOn(testComponent, 'chipRemove');

            chipInstance.remove();
            fixture.detectChanges();

            expect(testComponent.chipRemove).toHaveBeenCalledWith({ chip: chipInstance });
        });

        it('should not prevent the default click action', () => {
            const event = dispatchFakeEvent(chipNativeElement, 'click');
            fixture.detectChanges();

            expect(event.defaultPrevented).toBe(false);
        });

        it('should prevent the default click action when the chip is disabled', () => {
            chipInstance.disabled = true;
            fixture.detectChanges();

            const event = dispatchFakeEvent(chipNativeElement, 'click');
            fixture.detectChanges();

            expect(event.defaultPrevented).toBe(true);
        });

        it('should not dispatch `selectionChange` event when deselecting a non-selected chip', () => {
            chipInstance.deselect();

            const spy = jasmine.createSpy('selectionChange spy');
            const subscription = chipInstance.selectionChange.subscribe(spy);

            chipInstance.deselect();

            expect(spy).not.toHaveBeenCalled();
            subscription.unsubscribe();
        });

        it('should not dispatch `selectionChange` event when selecting a selected chip', () => {
            chipInstance.select();

            const spy = jasmine.createSpy('selectionChange spy');
            const subscription = chipInstance.selectionChange.subscribe(spy);

            chipInstance.select();

            expect(spy).not.toHaveBeenCalled();
            subscription.unsubscribe();
        });

        it('should not dispatch `selectionChange` event when selecting a selected chip via ' +
            'user interaction', () => {
            chipInstance.select();

            const spy = jasmine.createSpy('selectionChange spy');
            const subscription = chipInstance.selectionChange.subscribe(spy);

            chipInstance.selectViaInteraction();

            expect(spy).not.toHaveBeenCalled();
            subscription.unsubscribe();
        });

        it('should not dispatch `selectionChange` through setter if the value did not change', () => {
            chipInstance.selected = false;

            const spy = jasmine.createSpy('selectionChange spy');
            const subscription = chipInstance.selectionChange.subscribe(spy);

            chipInstance.selected = false;

            expect(spy).not.toHaveBeenCalled();
            subscription.unsubscribe();
        });

    });

    describe('keyboard behavior', () => {

        describe('when selectable is true', () => {
            beforeEach(() => {
                testComponent.selectable = true;
                fixture.detectChanges();
            });

            it('should selects/deselects the currently focused chip on SPACE', () => {
                const SPACE_EVENT: KeyboardEvent = createKeyboardEvent('keydown', SPACE) as KeyboardEvent;
                const CHIP_SELECTED_EVENT: ChipSelectionChange = {
                    source: chipInstance,
                    isUserInput: true,
                    selected: true,
                };

                const CHIP_DESELECTED_EVENT: ChipSelectionChange = {
                    source: chipInstance,
                    isUserInput: true,
                    selected: false,
                };

                spyOn(testComponent, 'chipSelectionChange');

                // Use the spacebar to select the chip
                chipInstance._handleKeydown(SPACE_EVENT);
                fixture.detectChanges();

                expect(chipInstance.selected).toBeTruthy();
                expect(testComponent.chipSelectionChange).toHaveBeenCalledTimes(1);
                expect(testComponent.chipSelectionChange).toHaveBeenCalledWith(CHIP_SELECTED_EVENT);

                // Use the spacebar to deselect the chip
                chipInstance._handleKeydown(SPACE_EVENT);
                fixture.detectChanges();

                expect(chipInstance.selected).toBeFalsy();
                expect(testComponent.chipSelectionChange).toHaveBeenCalledTimes(2);
                expect(testComponent.chipSelectionChange).toHaveBeenCalledWith(CHIP_DESELECTED_EVENT);
            });

            it('should have correct aria-selected', () => {
                expect(chipNativeElement.getAttribute('aria-selected')).toBe('false');

                testComponent.selected = true;
                fixture.detectChanges();

                expect(chipNativeElement.getAttribute('aria-selected')).toBe('true');
            });
        });

        describe('when selectable is false', () => {
            beforeEach(() => {
                testComponent.selectable = false;
                fixture.detectChanges();
            });

            it('SPACE ignores selection', () => {
                const SPACE_EVENT: KeyboardEvent = createKeyboardEvent('keydown', SPACE) as KeyboardEvent;

                spyOn(testComponent, 'chipSelectionChange');

                // Use the spacebar to attempt to select the chip
                chipInstance._handleKeydown(SPACE_EVENT);
                fixture.detectChanges();

                expect(chipInstance.selected).toBeFalsy();
                expect(testComponent.chipSelectionChange).not.toHaveBeenCalled();
            });

            it('should not have the aria-selected attribute', () => {
                expect(chipNativeElement.hasAttribute('aria-selected')).toBe(false);
            });
        });

        describe('when removable is true', () => {
            beforeEach(() => {
                testComponent.removable = true;
                fixture.detectChanges();
            });

            it('DELETE emits the (removed) event', () => {
                const DELETE_EVENT = createKeyboardEvent('keydown', DELETE) as KeyboardEvent;

                spyOn(testComponent, 'chipRemove');

                // Use the delete to remove the chip
                chipInstance._handleKeydown(DELETE_EVENT);
                fixture.detectChanges();

                expect(testComponent.chipRemove).toHaveBeenCalled();
            });

            it('BACKSPACE emits the (removed) event', () => {
                const BACKSPACE_EVENT = createKeyboardEvent('keydown', BACKSPACE) as KeyboardEvent;

                spyOn(testComponent, 'chipRemove');

                // Use the delete to remove the chip
                chipInstance._handleKeydown(BACKSPACE_EVENT);
                fixture.detectChanges();

                expect(testComponent.chipRemove).toHaveBeenCalled();
            });
        });

        describe('when removable is false', () => {
            beforeEach(() => {
                testComponent.removable = false;
                fixture.detectChanges();
            });

            it('DELETE does not emit the (removed) event', () => {
                const DELETE_EVENT = createKeyboardEvent('keydown', DELETE) as KeyboardEvent;

                spyOn(testComponent, 'chipRemove');

                // Use the delete to remove the chip
                chipInstance._handleKeydown(DELETE_EVENT);
                fixture.detectChanges();

                expect(testComponent.chipRemove).not.toHaveBeenCalled();
            });

            it('BACKSPACE does not emit the (removed) event', () => {
                const BACKSPACE_EVENT = createKeyboardEvent('keydown', BACKSPACE) as KeyboardEvent;

                spyOn(testComponent, 'chipRemove');

                // Use the delete to remove the chip
                chipInstance._handleKeydown(BACKSPACE_EVENT);
                fixture.detectChanges();

                expect(testComponent.chipRemove).not.toHaveBeenCalled();
            });
        });

        it('should update the aria-label for disabled chips', () => {
            expect(chipNativeElement.getAttribute('aria-disabled')).toBe('false');

            testComponent.disabled = true;
            fixture.detectChanges();

            expect(chipNativeElement.getAttribute('aria-disabled')).toBe('true');
        });

        it('should make disabled chips non-focusable', () => {
            expect(chipNativeElement.getAttribute('tabindex')).toBe('-1');

            testComponent.disabled = true;
            fixture.detectChanges();

            expect(chipNativeElement.getAttribute('tabindex')).toBeFalsy();
        });

    });
});

@Component({
    template: `
        <gd-chip-list>
            <div *ngIf="shouldShow">
                <gd-chip [selectable]="selectable"
                         [removable]="removable"
                         [selected]="selected"
                         [disabled]="disabled"
                         (focus)="chipFocus($event)"
                         (destroyed)="chipDestroy($event)"
                         (selectionChange)="chipSelectionChange($event)"
                         (removed)="chipRemove($event)">
                    {{ name }}
                </gd-chip>
            </div>
        </gd-chip-list>`,
})
class SingleChipComponent {
    disabled: boolean = false;
    name: string = 'Test';
    selected: boolean = false;
    selectable: boolean = true;
    removable: boolean = true;
    shouldShow: boolean = true;

    /* tslint:disable */
    chipFocus: (event?: ChipEvent) => void = () => {
    };
    chipDestroy: (event?: ChipEvent) => void = () => {
    };
    chipSelectionChange: (event?: ChipSelectionChange) => void = () => {
    };
    chipRemove: (event?: ChipEvent) => void = () => {
    };
    /* tslint:enable */
}
