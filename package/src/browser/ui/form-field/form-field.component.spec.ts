import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { fastTestSetup } from '../../../../test/helpers/fast-test-setup';
import { typeInElement } from '../../../../test/helpers/type-in-element';
import { ErrorComponent } from '../error/error.component';
import { InputDirective } from '../input/input.directive';
import { FormFieldComponent } from './form-field.component';


describe('browser.ui.FormFieldComponent', () => {
    let fixture: ComponentFixture<TestFormFieldComponent>;
    let component: TestFormFieldComponent;

    const getHeroNameInputEl = (): HTMLInputElement =>
        fixture.debugElement.query(By.css('#heroNameInput')).nativeElement;

    const expectError = (errorName: string): any => {
        const errors = fixture.debugElement.queryAll(By.directive(ErrorComponent));
        const visibleErrors = errors.filter(err => err.componentInstance.show);

        if (visibleErrors.length > 1) {
            throw new Error('Error should be shown only one at once.');
        } else if (visibleErrors.length === 0) {
            throw new Error('No error shown.');
        }

        const error = visibleErrors[0];

        return expect((<ErrorComponent>error.componentInstance).errorName).toEqual(errorName);
    };

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                imports: [
                    FormsModule,
                    ReactiveFormsModule,
                ],
                declarations: [
                    InputDirective,
                    FormFieldComponent,
                    ErrorComponent,
                    TestFormFieldComponent,
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestFormFieldComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('error', () => {
        it('should show first error when several errors are caught.', async(() => {
            typeInElement(
                'Invalid hero name because it is too long and pattern not matched',
                getHeroNameInputEl(),
            );
            fixture.detectChanges();

            fixture.whenStable().then(() => {
                fixture.detectChanges();
                expectError('maxlength');
            });
        }));

        it('should show error when set error programmatically.', async(() => {
            component.heroForm.get('heroName').setErrors({ pattern: true });
            fixture.detectChanges();

            fixture.whenStable().then(() => {
                fixture.detectChanges();
                expectError('pattern');
            });
        }));
    });
});


@Component({
    template: `        
        <form [formGroup]="heroForm">
            <gd-form-field>
                <input gdInput
                       formControlName="heroName"
                       id="heroNameInput">

                <gd-error errorName="required">
                    Hero name required!
                </gd-error>
                <gd-error errorName="maxlength">
                    Too long
                </gd-error>
                <gd-error errorName="pattern">
                    Invalid format
                </gd-error>
            </gd-form-field>
        </form>
    `,
})
class TestFormFieldComponent {
    heroForm = new FormGroup({
        heroName: new FormControl('', [
            Validators.required,
            Validators.maxLength(10),
            Validators.pattern(/^[\S]$/),
        ]),
    });
}
