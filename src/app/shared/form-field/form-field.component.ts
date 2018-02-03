import {
    AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, ContentChildren, ElementRef,
    HostBinding, QueryList
} from '@angular/core';
import { FormFieldControlDirective } from './form-field-control.directive';
import { FormFieldErrorComponent } from './form-field-error.component';
import { FormFieldHintComponent } from './form-field-hint.component';


@Component({
    selector: 'gd-form-field',
    templateUrl: './form-field.component.html',
    styleUrls: ['./form-field.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldComponent implements AfterViewInit {
    @ContentChild(FormFieldControlDirective) control: FormFieldControlDirective;
    @ContentChildren(FormFieldErrorComponent) errorChildren: QueryList<FormFieldErrorComponent>;
    @ContentChild(FormFieldHintComponent) hint: FormFieldHintComponent;
    @HostBinding('class.errorCaught') errorCaught = false;

    constructor(
        public elementRef: ElementRef,
        private changeDetectorRef: ChangeDetectorRef) {
    }

    ngAfterViewInit(): void {
        if (!this.control) {
            throw new Error();
        }

        this.control.statusChanges.subscribe(() => {
            // Describing order: error, hint
            this.validateError();
            this.validateHint();
            this.changeDetectorRef.markForCheck();
        });

        if (this.control.ngControl.dirty || this.control.ngControl.touched) {
            this.validateError();
            this.validateHint();
            this.changeDetectorRef.markForCheck();
        }
    }

    private validateError(): void {
        const formErrors = this.control.getErrors();

        // Reset error children.
        this.errorChildren.forEach(error => error.show = false);

        const targetError = this.selectFirstError(Object.keys(formErrors));

        if (targetError) {
            targetError.show = true;
            this.errorCaught = true;
        } else {
            this.errorCaught = false;
        }
    }

    private validateHint(): void {
        if (!this.hint) {
            return;
        }

        this.hint.show = !this.errorCaught;
    }

    private selectFirstError(errorNames: string[]): FormFieldErrorComponent {
        return this.errorChildren.find(error => errorNames.includes(error.errorName));
    }
}
