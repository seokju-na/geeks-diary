import { Component, DebugElement, NgModule } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { fastTestSetup, typeInElement } from '../../../../test/helpers';
import { InputModule } from '../input';
import { FormFieldErrorComponent } from './form-field-error.component';
import { FormFieldModule } from './form-field.module';


describe('browser.ui.formField', () => {
    const getDisplayedErrorDe = (fixture: ComponentFixture<any>): DebugElement | undefined =>
        fixture.debugElement
            .queryAll(By.directive(FormFieldErrorComponent))
            .find(errorDe => (errorDe.componentInstance as FormFieldErrorComponent).show);

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                imports: [TestFormFieldModule],
            })
            .compileComponents();
    });

    describe('form field with input', () => {
        let fixture: ComponentFixture<FormFieldWithInputComponent>;
        let component: FormFieldWithInputComponent;

        let inputEl: HTMLInputElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(FormFieldWithInputComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();

            inputEl = fixture.debugElement.query(
                By.css('#input'),
            ).nativeElement as HTMLInputElement;
        });

        it('should show only the first error.', () => {
            typeInElement(
                'Invalid string because it is too long and pattern not matched',
                inputEl,
            );
            fixture.detectChanges();

            const error = getDisplayedErrorDe(fixture);
            expect((error.componentInstance as FormFieldErrorComponent).errorName).toEqual('maxlength');
        });
    });
});


@Component({
    template: `
        <gd-form-field>
            <label for="input" gdFormFieldLabel>Label</label>
            <input gdInput [formControl]="control" id="input">

            <gd-form-field-description>Description</gd-form-field-description>

            <gd-form-field-error errorName="required">Required</gd-form-field-error>
            <gd-form-field-error errorName="maxlength">Too long</gd-form-field-error>
            <gd-form-field-error errorName="pattern">Invalid format</gd-form-field-error>
        </gd-form-field>
    `,
})
class FormFieldWithInputComponent {
    control = new FormControl('', [
        Validators.required,
        Validators.maxLength(10),
        Validators.pattern(/^[\S]$/),
    ]);
}


@NgModule({
    imports: [
        ReactiveFormsModule,
        FormFieldModule,
        InputModule,
    ],
    declarations: [
        FormFieldWithInputComponent,
    ],
    exports: [
        FormFieldModule,
        FormFieldWithInputComponent,
    ],
})
class TestFormFieldModule {
}
