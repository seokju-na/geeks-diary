import {
    AfterViewInit,
    Directive,
    DoCheck,
    ElementRef,
    Input,
    NgZone,
    OnDestroy,
    Renderer2,
} from '@angular/core';
import { Subject } from 'rxjs';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { auditTime, takeUntil } from 'rxjs/operators';


@Directive({
    selector: 'textarea[gdAutosize]',
})
export class AutosizeDirective implements AfterViewInit, DoCheck, OnDestroy {
    private previousValue: string;
    private readonly destroyed = new Subject<void>();
    private cachedLineHeight: number;

    constructor(
        private elementRef: ElementRef,
        private renderer: Renderer2,
        private ngZone: NgZone,
    ) {
    }

    private _minRows: number;

    get minRows(): number {
        return this._minRows;
    }

    @Input()
    set minRows(value: number) {
        this._minRows = value;
        this.setMinHeight();
    }

    private _maxRows: number;

    get maxRows(): number {
        return this._maxRows;
    }

    @Input()
    set maxRows(value: number) {
        this._maxRows = value;
        this.setMaxHeight();
    }

    ngAfterViewInit(): void {
        this.resizeToFitContent();

        this.ngZone.runOutsideAngular(() => {
            fromEvent(window, 'resize')
                .pipe(auditTime(16), takeUntil(this.destroyed))
                .subscribe(() => this.resizeToFitContent(true));
        });
    }

    ngDoCheck(): void {
        this.resizeToFitContent();
    }

    ngOnDestroy(): void {
        this.destroyed.next();
        this.destroyed.complete();
    }

    private setMinHeight(): void {
        const minHeight = this.minRows && this.cachedLineHeight
            ? `${this.minRows * this.cachedLineHeight}px`
            : null;

        if (minHeight) {
            this.renderer.setStyle(this.elementRef.nativeElement, 'minHeight', minHeight);
        }
    }

    private setMaxHeight(): void {
        const maxHeight = this.maxRows && this.cachedLineHeight
            ? `${this.maxRows * this.cachedLineHeight}px`
            : null;

        if (maxHeight) {
            this.renderer.setStyle(this.elementRef.nativeElement, 'maxHeight', maxHeight);
        }
    }

    private cacheTextareaLintHeight(): void {
        if (this.cachedLineHeight) {
            return;
        }

        const textarea = this.elementRef.nativeElement as HTMLTextAreaElement;

        // Use a clone element because we have to override some styles.
        const textareaClone = textarea.cloneNode(false) as HTMLTextAreaElement;
        textareaClone.rows = 1;

        // Use `position: absolute` so that this doesn't cause a browser layout and use
        // `visibility: hidden` so that nothing is rendered. Clear any other styles that
        // would affect the height.
        textareaClone.style.position = 'absolute';
        textareaClone.style.visibility = 'hidden';
        textareaClone.style.border = 'none';
        textareaClone.style.padding = '0';
        textareaClone.style.height = '';
        textareaClone.style.minHeight = '';
        textareaClone.style.maxHeight = '';

        // In Firefox it happens that textarea elements are always bigger than the specified amount
        // of rows. This is because Firefox tries to add extra space for the horizontal scrollbar.
        // As a workaround that removes the extra space for the scrollbar, we can just set overflow
        // to hidden. This ensures that there is no invalid calculation of the line height.
        // See Firefox bug report: https://bugzilla.mozilla.org/show_bug.cgi?id=33654
        textareaClone.style.overflow = 'hidden';

        textarea.parentNode.appendChild(textareaClone);
        this.cachedLineHeight = textareaClone.clientHeight;
        textarea.parentNode.removeChild(textareaClone);

        // Min and max heights have to be re-calculated if the cached line height changes
        this.setMinHeight();
        this.setMaxHeight();
    }

    private resizeToFitContent(force: boolean = false) {
        this.cacheTextareaLintHeight();

        // If we haven't determined the line-height yet, we know we're still hidden and there's no
        // point in checking the height of the textarea.
        if (!this.cachedLineHeight) {
            return;
        }

        const textarea = this.elementRef.nativeElement as HTMLTextAreaElement;
        const value = textarea.value;

        // Only resize of the value changed since these calculations can be expensive.
        if (value === this.previousValue && !force) {
            return;
        }

        const placeholderText = textarea.placeholder;

        // Reset the textarea height to auto in order to shrink back to its default size.
        // Also temporarily force overflow:hidden, so scroll bars do not interfere with
        // calculations. Long placeholders that are wider than the textarea width may lead to a
        // bigger scrollHeight value. To ensure that the scrollHeight is not bigger than the
        // content, the placeholders need to be removed temporarily.
        textarea.style.height = 'auto';
        textarea.style.overflow = 'hidden';
        textarea.placeholder = '';

        // Use the scrollHeight to know how large the textarea *would* be if fit its entire value.
        textarea.style.height = `${textarea.scrollHeight}px`;
        textarea.style.overflow = '';
        textarea.placeholder = placeholderText;

        this.previousValue = value;
    }
}
