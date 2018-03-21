import { Component, DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
    FormControl,
    FormGroup,
    FormGroupDirective,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { FormFieldControlDirective } from './form-field-control.directive';
import { FormFieldErrorComponent } from './form-field-error.component';
import { FormFieldComponent } from './form-field.component';


describe('app.shared.formField', () => {
    let fixture: ComponentFixture<HeroFormFieldComponent>;
    let component: HeroFormFieldComponent;

    let heroRegisterForm: DebugElement;
    let heroNameInput: DebugElement;

    beforeEach(async(() => {
        TestBed
            .configureTestingModule({
                imports: [
                    ReactiveFormsModule,
                ],
                declarations: [
                    HeroFormFieldComponent,
                    FormFieldComponent,
                    FormFieldControlDirective,
                    FormFieldErrorComponent,
                ],
            })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HeroFormFieldComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        heroRegisterForm = fixture.debugElement.query(By.directive(FormGroupDirective));
        heroNameInput = fixture.debugElement.query(By.directive(FormFieldControlDirective));
    });

    describe('form which update value on submit', () => {
        it('should show first error of form filed when status changes.', async(() => {
            heroNameInput.nativeElement.value = 'Invalid hero name because it is too long';
            heroNameInput.triggerEventHandler('input', { target: heroNameInput.nativeElement });
            fixture.detectChanges();

            heroRegisterForm.triggerEventHandler('submit', {});
            fixture.detectChanges();

            fixture.whenStable().then(() => {
                fixture.detectChanges();

                const errorMessage = fixture.debugElement
                    .queryAll(By.directive(FormFieldErrorComponent))
                    .find(c => c.componentInstance.show);

                expect(errorMessage).not.toBeNull();
                expect(errorMessage.componentInstance.errorName).toEqual('maxlength');
                expect(errorMessage.nativeElement.textContent).toContain(component.errorMessages.maxLength);
            });
        }));

        it('should error appeared when patch value from form object.', async(() => {
            component.heroRegisterForm.patchValue({
                name: 'Not valid',
            });
            fixture.detectChanges();

            fixture.whenStable().then(() => {
                fixture.detectChanges();

                const errorMessage = fixture.debugElement
                    .queryAll(By.directive(FormFieldErrorComponent))
                    .find(c => c.componentInstance.show);

                expect(errorMessage).not.toBeNull();
                expect(errorMessage.componentInstance.errorName).toEqual('pattern');
                expect(errorMessage.nativeElement.textContent)
                    .toContain(component.errorMessages.invalidNameFormat);
            });
        }));
    });
});


@Component({
    template: `
        <form [formGroup]="heroRegisterForm">
            <gd-form-field id="testFormField">
                <input gdFormFieldControl formControlName="name" id="heroNameInput" type="text">
                <gd-form-field-error errorName="required">
                    {{errorMessages.nameRequired}}
                </gd-form-field-error>
                <gd-form-field-error errorName="maxlength">
                    {{errorMessages.maxLength}}
                </gd-form-field-error>
                <gd-form-field-error errorName="pattern">
                    {{errorMessages.invalidNameFormat}}
                </gd-form-field-error>
            </gd-form-field>
        </form>
    `,
})
class HeroFormFieldComponent {
    heroRegisterForm = new FormGroup({
        name: new FormControl('', [
            Validators.required,
            Validators.maxLength(10),
            Validators.pattern(/^[\S]$/)]),
    }, { updateOn: 'submit' });

    errorMessages = {
        nameRequired: 'Hero name required!',
        maxLength: 'Too long!',
        invalidNameFormat: 'Invalid format!',
    };
}
