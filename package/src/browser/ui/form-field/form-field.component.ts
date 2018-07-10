import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    HostBinding,
    QueryList,
    ViewEncapsulation,
} from '@angular/core';
import { ErrorComponent } from '../error/error.component';
import { FormFieldControl } from './form-field-control';


@Component({
    selector: 'gd-form-field',
    templateUrl: './form-field.component.html',
    styleUrls: [
        './form-field.component.scss',
        '../input/input.scss',
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class FormFieldComponent implements AfterViewInit {
    @ContentChild(FormFieldControl) control: FormFieldControl;
    @ContentChildren(ErrorComponent) errorChildren: QueryList<ErrorComponent>;

    @HostBinding('class.FormField')
    private get className() {
        return true;
    }

    @HostBinding('class.FormField--invalid')
    private get invalidClassName() {
        return this._errorCaught;
    }

    @HostBinding('class.ng-invalid')
    private get ngInvalidClassName() {
        return this._errorCaught;
    }

    private _errorCaught = false;

    constructor(
        public _elementRef: ElementRef,
        private changeDetectorRef: ChangeDetectorRef,
    ) {
    }

    ngAfterViewInit(): void {
        if (!this.control) {
            throw new Error('Control must provided.');
        }

        this.control.statusChanges.subscribe(() => {
            // Describing order: error, hint
            this.validateError();
            this.changeDetectorRef.markForCheck();
        });

        if (this.control.ngControl.dirty || this.control.ngControl.touched) {
            this.validateError();
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
            this._errorCaught = true;
        } else {
            this._errorCaught = false;
        }
    }

    private selectFirstError(errorNames: string[]): ErrorComponent {
        return this.errorChildren.find(error => errorNames.includes(error.errorName));
    }
}
