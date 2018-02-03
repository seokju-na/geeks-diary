/**
 * This is hard replica of material2's autocomplete.
 * All source are from google's material2 project.
 * See https://github.com/angular/material2/tree/master/src/lib/autocomplete.
 */
import {
    ConnectedPositionStrategy,
    Overlay,
    OverlayConfig,
    OverlayRef,
    PositionStrategy
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import {
    ChangeDetectorRef,
    Directive,
    ElementRef,
    forwardRef,
    Host,
    HostBinding,
    HostListener,
    Inject,
    Input,
    NgZone,
    OnDestroy,
    Optional,
    ViewContainerRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { defer } from 'rxjs/observable/defer';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { merge } from 'rxjs/observable/merge';
import { of } from 'rxjs/observable/of';
import { delay, filter, switchMap, take, tap } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { KeyCodes } from '../../../common/key-codes';
import { FormFieldComponent } from '../form-field/form-field.component';
import { OptionItemComponent, OptionItemSelectionChange } from '../option-item/option-item.component';
import { AutocompleteComponent } from './autocomplete.component';


const AUTOCOMPLETE_OPTION_HEIGHT = 48;
const AUTOCOMPLETE_PANEL_HEIGHT = 256;

export const AUTOCOMPLETE_TRIGGER_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AutocompleteTriggerDirective),
    multi: true
};


@Directive({
    selector: 'input[gdAutocomplete]',
    providers: [AUTOCOMPLETE_TRIGGER_VALUE_ACCESSOR]
})
export class AutocompleteTriggerDirective implements ControlValueAccessor, OnDestroy {
    @Input() autocomplete: AutocompleteComponent;

    private _panelOpen = false;
    private previousValue: string | number = null;
    private overlayRef: OverlayRef | null = null;
    private portal: TemplatePortal | null = null;
    private positionStrategy: ConnectedPositionStrategy;
    private componentDestroyed = false;
    private closingActionsSubscription: Subscription;
    private closeKeyEventStream = new Subject<void>();
    private optionSelections: Observable<OptionItemSelectionChange> = defer(() => {
        if (this.autocomplete && this.autocomplete.options) {
            return merge(...this.autocomplete.options.map(option => option.selectionChange));
        }

        // If there are any subscribers before `ngAfterViewInit`, the `autocomplete` will be undefined.
        // Return a stream that we'll replace with the real one once everything is in place.
        return this.zone.onStable
            .asObservable()
            .pipe(take(1), switchMap(() => this.optionSelections));
    });

    @HostBinding('attr.role') readonly roletAttr = 'combobox';
    @HostBinding('attr.autocomplete') readonly autocompleteAttr = 'off';

    _onChange: (value: any) => void = () => {};
    _onTouched = () => {};

    constructor(private elementRef: ElementRef,
                private viewContainerRef: ViewContainerRef,
                private overlay: Overlay,
                private zone: NgZone,
                private changeDetectorRef: ChangeDetectorRef,
                @Optional() @Host() private formField: FormFieldComponent,
                @Optional() @Inject(DOCUMENT) private _document: any) {
    }

    get panelOpen(): boolean {
        return this._panelOpen && this.autocomplete.showPanel;
    }

    get panelClosingActions(): Observable<OptionItemSelectionChange> {
        return merge(
            this.optionSelections,
            this.autocomplete._keyManager.tabOut.pipe(filter(() => this._panelOpen)),
            this.closeKeyEventStream,
            this.outsideClickStream,
            this.overlayRef
                ? this.overlayRef.detachments().pipe(filter(() => this._panelOpen))
                : of()
        );
    }

    get activeOption(): OptionItemComponent | null {
        if (this.autocomplete && this.autocomplete._keyManager) {
            return this.autocomplete._keyManager.activeItem;
        }

        return null;
    }

    ngOnDestroy(): void {
        this.componentDestroyed = true;
        this.destroyPanel();
        this.closeKeyEventStream.complete();
    }

    openPanel(): void {
        this.attachOverlay();
    }

    closePanel(): void {
        if (this._panelOpen) {
            this.autocomplete._isOpen = this._panelOpen = false;

            if (this.overlayRef && this.overlayRef.hasAttached()) {
                this.overlayRef.detach();
                this.closingActionsSubscription.unsubscribe();
            }

            // Note that in some cases this can end up being called after the component is destroyed.
            // Add a check to ensure that we don't try to run change detection on a destroyed view.
            if (!this.componentDestroyed) {
                // We need to trigger change detection manually, because
                // `fromEvent` doesn't seem to do it at the proper time.
                // This ensures that the label is reset when the
                // user clicks outside.
                this.changeDetectorRef.detectChanges();
            }
        }
    }

    writeValue(value: any): void {
        Promise.resolve(null).then(() => this.setTriggerValue(value));
    }

    registerOnChange(fn: (value: any) => {}): void {
        this._onChange = fn;
    }

    registerOnTouched(fn: () => {}): void {
        this._onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.elementRef.nativeElement.disabled = isDisabled;
    }

    @HostListener('focusin')
    private handleFocus(): void {
        if (this.canOpen()) {
            this.previousValue = this.elementRef.nativeElement.value;
            this.attachOverlay();
        }
    }

    @HostListener('input', ['$event'])
    private handleInput(event: KeyboardEvent): void {
        const target = event.target as HTMLInputElement;
        const value: number | string | null = target.value;

        // If the input has a placeholder, IE will fire the `input` event on page load,
        // focus and blur, in addition to when the user actually changed the value. To
        // filter out all of the extra events, we save the value on focus and between
        // `input` events, and we check whether it changed.
        // See: https://connect.microsoft.com/IE/feedback/details/885747/
        if (this.canOpen()
            && this.previousValue !== value
            && document.activeElement === event.target) {

            this.previousValue = value;
            this._onChange(value);
            this.openPanel();
        }
    }

    @HostListener('keydown', ['$event'])
    private handleKeydown(event: KeyboardEvent): void {
        const keyCode = event.keyCode;

        // Close when pressing ESCAPE or ALT + UP_ARROW, based on the a11y guidelines.
        // See: https://www.w3.org/TR/wai-aria-practices-1.1/#textbox-keyboard-interaction
        if (this.panelOpen
            && (keyCode === KeyCodes.ESCAPE || (keyCode === KeyCodes.UP_ARROW && event.altKey))) {

            this.resetActiveItem();
            this.closeKeyEventStream.next();
            event.stopPropagation();
        } else if (this.activeOption && keyCode === KeyCodes.ENTER && this.panelOpen) {
            this.activeOption.selectViaInteraction();
            this.resetActiveItem();
            event.preventDefault();
        } else {
            const prevActiveItem = this.autocomplete._keyManager.activeItem;
            const isArrowKey = keyCode === KeyCodes.UP_ARROW || keyCode === KeyCodes.DOWN_ARROW;

            if (this.panelOpen || keyCode === KeyCodes.TAB) {
                this.autocomplete._keyManager.onKeydown(event);
            } else if (isArrowKey && this.canOpen()) {
                this.openPanel();
            }

            if (isArrowKey || this.autocomplete._keyManager.activeItem !== prevActiveItem) {
                this.scrollToOption();
            }
        }
    }

    private attachOverlay(): void {
        const width = this.elementRef.nativeElement.getBoundingClientRect().width;
        const config = new OverlayConfig({
            width,
            positionStrategy: this.getOverlayPosition(),
            scrollStrategy: this.overlay.scrollStrategies.reposition()
        });

        if (!this.overlayRef) {
            this.portal = new TemplatePortal(this.autocomplete.template, this.viewContainerRef);
            this.overlayRef = this.overlay.create(config);
        } else {
            this.overlayRef.updateSize({ width });
        }

        if (this.overlayRef && !this.overlayRef.hasAttached()) {
            this.overlayRef.attach(this.portal);
            this.closingActionsSubscription = this.subscribeToClosingActions();
        }

        this.autocomplete._setVisibility();
        this.autocomplete._isOpen = this._panelOpen = true;
    }

    private getOverlayPosition(): PositionStrategy {
        this.positionStrategy = this.overlay.position().connectedTo(
            this.elementRef,
            { originX: 'start', originY: 'bottom' },
            { overlayX: 'start', overlayY: 'top' })
            .withFallbackPosition(
                { originX: 'start', originY: 'top' },
                { overlayX: 'start', overlayY: 'bottom' }
            );

        return this.positionStrategy;
    }

    private subscribeToClosingActions(): Subscription {
        const firstStable = this.zone.onStable.asObservable().pipe(take(1));
        const optionChanges = this.autocomplete.options.changes.pipe(
            tap(() => this.positionStrategy.recalculateLastPosition()),
            // Defer emitting to the stream until the next tick, because changing
            // bindings in here will cause "changed after checked" errors.
            delay(0)
        );

        return merge(firstStable, optionChanges)
            .pipe(
                switchMap(() => {
                    this.resetActiveItem();
                    this.autocomplete._setVisibility();

                    return this.panelClosingActions;
                }),
                // when the first closing event occurs...
                take(1)
            )
            .subscribe(event => this.setValueAndClose(event));
    }

    private get outsideClickStream(): Observable<any> {
        if (!this._document) {
            return of(null);
        }

        return merge(fromEvent(this._document, 'click'), fromEvent(this._document, 'touchend'))
            .pipe(filter((event: MouseEvent | TouchEvent) => {
                const clickTarget = event.target as HTMLElement;
                const formField = this.formField ?
                    this.formField.elementRef.nativeElement : null;

                return this._panelOpen &&
                    clickTarget !== this.elementRef.nativeElement &&
                    (!formField || !formField.contains(clickTarget)) &&
                    (!!this.overlayRef && !this.overlayRef.overlayElement.contains(clickTarget));
            }));
    }

    private setValueAndClose(event: OptionItemSelectionChange | null): void {
        if (event && event.source) {
            this.clearPreviousSelectedOption(event.source);
            this.setTriggerValue(event.source.value);
            this._onChange(event.source.value);
            this.elementRef.nativeElement.focus();
            this.autocomplete._emitSelectEvent(event.source);
        }

        this.closePanel();
    }

    private clearPreviousSelectedOption(skip: OptionItemComponent) {
        this.autocomplete.options.forEach((option) => {
            if (option !== skip && option.selected) {
                option.deselect();
            }
        });
    }

    private destroyPanel(): void {
        if (this.overlayRef) {
            this.closePanel();
            this.overlayRef.dispose();
            this.overlayRef = null;
        }
    }

    private setTriggerValue(value: any): void {
        const toDisplay = this.autocomplete && this.autocomplete.displayWith
            ? this.autocomplete.displayWith(value)
            : value;

        this.elementRef.nativeElement.value = toDisplay !== null ? toDisplay : '';
    }

    private resetActiveItem(): void {
        this.autocomplete._keyManager.setActiveItem(-1);
    }

    private scrollToOption(): void {
        const activeOptionIndex = this.autocomplete._keyManager.activeItemIndex || 0;
        const optionOffset = activeOptionIndex * AUTOCOMPLETE_OPTION_HEIGHT;
        const panelTop = this.autocomplete._getScrollTop();

        if (optionOffset < panelTop) {
            // Scroll up to reveal selected option scrolled above the panel top
            this.autocomplete._setScrollTop(optionOffset);
        } else if (optionOffset + AUTOCOMPLETE_OPTION_HEIGHT > panelTop + AUTOCOMPLETE_PANEL_HEIGHT) {
            // Scroll down to reveal selected option scrolled below the panel bottom
            const newScrollTop = optionOffset - AUTOCOMPLETE_PANEL_HEIGHT + AUTOCOMPLETE_OPTION_HEIGHT;
            this.autocomplete._setScrollTop(Math.max(0, newScrollTop));
        }
    }

    private canOpen(): boolean {
        const element: HTMLInputElement = this.elementRef.nativeElement;
        return !element.readOnly && !element.disabled;
    }
}
