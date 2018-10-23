import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    QueryList,
    ViewEncapsulation,
} from '@angular/core';
import { FormFieldControl } from './form-field-control';
import { FormFieldErrorComponent } from './form-field-error.component';
import { FormFieldLabelDirective } from './form-field-label.directive';


@Component({
    selector: 'gd-form-field',
    templateUrl: './form-field.component.html',
    styleUrls: [
        './form-field.component.scss',
        './form-field-label.scss',
        './form-field-error.scss',
        './form-field-description.scss',
        '../input/input.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'class': 'FormField',
        '[class.FormField--invalid]': '_errorCaught',
        '[class.FormField--disabled]': '_control?.disabled',
        '[class.FormField--focused]': '_control?.focused',
    },
})
export class FormFieldComponent implements AfterViewInit {
    @ContentChild(FormFieldControl) _control: FormFieldControl;
    @ContentChild(FormFieldLabelDirective) _labelChild: FormFieldLabelDirective;
    @ContentChildren(FormFieldErrorComponent) _errorChildren: QueryList<FormFieldErrorComponent>;

    private _errorCaught = false;

    constructor(
        public elementRef: ElementRef<HTMLElement>,
        private changeDetector: ChangeDetectorRef,
    ) {
    }

    ngAfterViewInit(): void {
        if (!this._control) {
            throw new Error('Form file control must be provided.');
        }

        this._control.statusChanges.subscribe(() => {
            this.validateError();
            this.changeDetector.markForCheck();
        });

        if (this._control.ngControl.dirty || this._control.ngControl.touched) {
            this.validateError();
            this.changeDetector.markForCheck();
        }
    }

    private validateError(): void {
        const formErrors = this._control.getErrors();

        // Reset error children.
        this._errorChildren.forEach(error => error.show);

        const targetError = this.selectFirstError(Object.keys(formErrors));

        if (targetError) {
            targetError.show = true;
            this._errorCaught = true;
        } else {
            this._errorCaught = false;
        }
    }

    private selectFirstError(errorNames: string[]): FormFieldErrorComponent {
        return this._errorChildren.find(error => errorNames.includes(error.errorName));
    }
}
