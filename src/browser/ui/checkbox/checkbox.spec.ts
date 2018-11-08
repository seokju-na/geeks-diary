import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { fastTestSetup } from '../../../../test/helpers';
import { CheckboxChange, CheckboxComponent } from './checkbox.component';
import { CheckboxModule } from './checkbox.module';


describe('browser.ui.checkbox', () => {
    let fixture: ComponentFixture<TestCheckboxComponent>;

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                imports: [
                    FormsModule,
                    ReactiveFormsModule,
                    CheckboxModule,
                ],
                declarations: [
                    TestCheckboxComponent,
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestCheckboxComponent);
        fixture.detectChanges();
    });

    describe('basic behavior', () => {
        let checkboxDebugElement: DebugElement;
        let checkboxNativeElement: HTMLElement;
        let checkboxInstance: CheckboxComponent;
        let testComponent: TestCheckboxComponent;
        let inputElement: HTMLInputElement;
        let labelElement: HTMLLabelElement;

        beforeEach(() => {
            checkboxDebugElement = fixture.debugElement.query(By.directive(CheckboxComponent));
            checkboxNativeElement = checkboxDebugElement.nativeElement;
            checkboxInstance = checkboxDebugElement.componentInstance;
            testComponent = fixture.debugElement.componentInstance;
            inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');
            labelElement = <HTMLLabelElement>checkboxNativeElement.querySelector('label');
        });

        it('should add and remove the checked state', () => {
            expect(checkboxInstance.checked).toBe(false);
            expect(checkboxNativeElement.classList).not.toContain('Checkbox--checked');
            expect(inputElement.checked).toBe(false);

            testComponent.control.patchValue(true);
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(true);
            expect(checkboxNativeElement.classList).toContain('Checkbox--checked');
            expect(inputElement.checked).toBe(true);

            testComponent.control.patchValue(false);
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(false);
            expect(checkboxNativeElement.classList).not.toContain('Checkbox--checked');
            expect(inputElement.checked).toBe(false);
        });

        it('should add and remove indeterminate state', () => {
            expect(checkboxNativeElement.classList).not.toContain('Checkbox--checked');
            expect(inputElement.checked).toBe(false);
            expect(inputElement.indeterminate).toBe(false);
            expect(inputElement.getAttribute('aria-checked'))
                .toBe('false', 'Expect aria-checked to be false');

            testComponent.isIndeterminate = true;
            fixture.detectChanges();

            expect(checkboxNativeElement.classList).toContain('Checkbox--indeterminate');
            expect(inputElement.checked).toBe(false);
            expect(inputElement.indeterminate).toBe(true);
            expect(inputElement.getAttribute('aria-checked'))
                .toBe('mixed', 'Expect aria checked to be mixed for indeterminate checkbox');

            testComponent.isIndeterminate = false;
            fixture.detectChanges();

            expect(checkboxNativeElement.classList).not.toContain('Checkbox--indeterminate');
            expect(inputElement.checked).toBe(false);
            expect(inputElement.indeterminate).toBe(false);
        });

        it('should set indeterminate to false when input clicked', fakeAsync(() => {
            testComponent.isIndeterminate = true;
            fixture.detectChanges();

            expect(checkboxInstance.indeterminate).toBe(true);
            expect(inputElement.indeterminate).toBe(true);
            expect(testComponent.isIndeterminate).toBe(true);

            inputElement.click();
            fixture.detectChanges();

            // Flush the microtasks because the forms module updates the model state asynchronously.
            flush();

            // The checked property has been updated from the model and now the view needs
            // to reflect the state change.
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(true);
            expect(inputElement.indeterminate).toBe(false);
            expect(inputElement.checked).toBe(true);
            expect(testComponent.isIndeterminate).toBe(false);

            testComponent.isIndeterminate = true;
            fixture.detectChanges();

            expect(checkboxInstance.indeterminate).toBe(true);
            expect(inputElement.indeterminate).toBe(true);
            expect(inputElement.checked).toBe(true);
            expect(testComponent.isIndeterminate).toBe(true);
            expect(inputElement.getAttribute('aria-checked'))
                .toBe('true', 'Expect aria checked to be true');

            inputElement.click();
            fixture.detectChanges();

            // Flush the microtasks because the forms module updates the model state asynchronously.
            flush();

            // The checked property has been updated from the model and now the view needs
            // to reflect the state change.
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(false);
            expect(inputElement.indeterminate).toBe(false);
            expect(inputElement.checked).toBe(false);
            expect(testComponent.isIndeterminate).toBe(false);
        }));

        it('should not set indeterminate to false when checked is set programmatically', () => {
            testComponent.isIndeterminate = true;
            fixture.detectChanges();

            expect(checkboxInstance.indeterminate).toBe(true);
            expect(inputElement.indeterminate).toBe(true);
            expect(testComponent.isIndeterminate).toBe(true);

            testComponent.control.patchValue(true);
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(true);
            expect(inputElement.indeterminate).toBe(true);
            expect(inputElement.checked).toBe(true);
            expect(testComponent.isIndeterminate).toBe(true);

            testComponent.control.patchValue(false);
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(false);
            expect(inputElement.indeterminate).toBe(true);
            expect(inputElement.checked).toBe(false);
            expect(testComponent.isIndeterminate).toBe(true);
        });

        it('should change native element checked when check programmatically', () => {
            expect(inputElement.checked).toBe(false);

            checkboxInstance.checked = true;
            fixture.detectChanges();

            expect(inputElement.checked).toBe(true);
        });

        it('should toggle checked state on click', () => {
            expect(checkboxInstance.checked).toBe(false);

            labelElement.click();
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(true);

            labelElement.click();
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(false);
        });

        it('should change from indeterminate to checked on click', fakeAsync(() => {
            testComponent.control.patchValue(false);
            testComponent.isIndeterminate = true;
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(false);
            expect(checkboxInstance.indeterminate).toBe(true);

            checkboxInstance._onInputClick(<Event>{stopPropagation: () => {}});

            // Flush the microtasks because the indeterminate state will be updated in the next tick.
            flush();

            expect(checkboxInstance.checked).toBe(true);
            expect(checkboxInstance.indeterminate).toBe(false);

            checkboxInstance._onInputClick(<Event>{stopPropagation: () => {}});
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(false);
            expect(checkboxInstance.indeterminate).toBe(false);

            flush();
        }));

        it('should add and remove disabled state', () => {
            expect(checkboxInstance.disabled).toBe(false);
            expect(checkboxNativeElement.classList).not.toContain('Checkbox--disabled');
            expect(inputElement.tabIndex).toBe(0);
            expect(inputElement.disabled).toBe(false);

            testComponent.control.disable();
            fixture.detectChanges();

            expect(checkboxInstance.disabled).toBe(true);
            expect(checkboxNativeElement.classList).toContain('Checkbox--disabled');
            expect(inputElement.disabled).toBe(true);

            testComponent.control.enable();
            fixture.detectChanges();

            expect(checkboxInstance.disabled).toBe(false);
            expect(checkboxNativeElement.classList).not.toContain('Checkbox--disabled');
            expect(inputElement.tabIndex).toBe(0);
            expect(inputElement.disabled).toBe(false);
        });

        it('should not toggle `checked` state upon interation while disabled', () => {
            testComponent.control.disable();
            fixture.detectChanges();

            checkboxNativeElement.click();
            expect(checkboxInstance.checked).toBe(false);
        });

        it('should overwrite indeterminate state when clicked', fakeAsync(() => {
            testComponent.isIndeterminate = true;
            fixture.detectChanges();

            inputElement.click();
            fixture.detectChanges();

            // Flush the microtasks because the indeterminate state will be updated in the next tick.
            flush();

            expect(checkboxInstance.checked).toBe(true);
            expect(checkboxInstance.indeterminate).toBe(false);
        }));

        it('should preserve the user-provided id', () => {
            expect(checkboxNativeElement.id).toBe('simple-check');
            expect(inputElement.id).toBe('simple-check-input');
        });

        it('should project the checkbox content into the label element', () => {
            const label = <HTMLLabelElement>checkboxNativeElement.querySelector('.Checkbox__label');
            expect(label.textContent.trim()).toBe('Simple checkbox');
        });

        it('should make the host element a tab stop', () => {
            expect(inputElement.tabIndex).toBe(0);
        });

        it('should not trigger the click event multiple times', () => {
            // By default, when clicking on a label element, a generated click will be dispatched
            // on the associated input element.
            // Since we're using a label element and a visual hidden input, this behavior can led
            // to an issue, where the click events on the checkbox are getting executed twice.

            spyOn(testComponent, 'onCheckboxClick');

            expect(inputElement.checked).toBe(false);
            expect(checkboxNativeElement.classList).not.toContain('Checkbox--checked');

            labelElement.click();
            fixture.detectChanges();

            expect(checkboxNativeElement.classList).toContain('Checkbox--checked');
            expect(inputElement.checked).toBe(true);

            expect(testComponent.onCheckboxClick).toHaveBeenCalledTimes(1);
        });

        it('should trigger a change event when the native input does', fakeAsync(() => {
            spyOn(testComponent, 'onCheckboxChange');

            expect(inputElement.checked).toBe(false);
            expect(checkboxNativeElement.classList).not.toContain('Checkbox--checked');

            labelElement.click();
            fixture.detectChanges();

            expect(inputElement.checked).toBe(true);
            expect(checkboxNativeElement.classList).toContain('Checkbox--checked');

            fixture.detectChanges();
            flush();

            // The change event shouldn't fire, because the value change was not caused
            // by any interaction.
            expect(testComponent.onCheckboxChange).toHaveBeenCalledTimes(1);
        }));

        it('should not trigger the change event by changing the native value', fakeAsync(() => {
            spyOn(testComponent, 'onCheckboxChange');

            expect(inputElement.checked).toBe(false);
            expect(checkboxNativeElement.classList).not.toContain('Checkbox--checked');

            testComponent.control.patchValue(true);
            fixture.detectChanges();

            expect(inputElement.checked).toBe(true);
            expect(checkboxNativeElement.classList).toContain('Checkbox--checked');

            fixture.detectChanges();
            flush();

            // The change event shouldn't fire, because the value change was not caused
            // by any interaction.
            expect(testComponent.onCheckboxChange).not.toHaveBeenCalled();
        }));

        it('should focus on underlying input element when focus() is called', () => {
            expect(document.activeElement).not.toBe(inputElement);

            checkboxInstance.focus();
            fixture.detectChanges();

            expect(document.activeElement).toBe(inputElement);
        });

        it('should forward the value to input element', () => {
            testComponent.checkboxValue = 'basic_checkbox';
            fixture.detectChanges();

            expect(inputElement.value).toBe('basic_checkbox');
        });

        it('should remove the SVG checkmark from the tab order', () => {
            expect(checkboxNativeElement.querySelector('svg').getAttribute('focusable')).toBe('false');
        });
    });
});


@Component({
    template: `
        <div (click)="parentElementClicked = true" (keyup)="parentElementKeyedUp = true">
            <gd-checkbox
                [id]="checkboxId"
                [formControl]="control"
                [(indeterminate)]="isIndeterminate"
                [value]="checkboxValue"
                (click)="onCheckboxClick($event)"
                (change)="onCheckboxChange($event)">
                Simple checkbox
            </gd-checkbox>
        </div>
    `,
})
class TestCheckboxComponent {
    readonly control = new FormControl(false);

    isIndeterminate: boolean = false;
    parentElementClicked: boolean = false;
    parentElementKeyedUp: boolean = false;
    checkboxId: string | null = 'simple-check';
    checkboxValue: string = 'single_checkbox';

    /* tslint:disable */
    onCheckboxClick: (event?: Event) => void = () => {
    };
    onCheckboxChange: (event?: CheckboxChange) => void = () => {
    };
    /* tslint:enable */
}
