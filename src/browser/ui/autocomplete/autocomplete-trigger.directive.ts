/**
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { DOWN_ARROW, ENTER, ESCAPE, TAB, UP_ARROW } from '@angular/cdk/keycodes';
import {
    FlexibleConnectedPositionStrategy,
    Overlay,
    OverlayConfig,
    OverlayRef,
    ViewportRuler,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
    ChangeDetectorRef,
    Directive,
    ElementRef,
    forwardRef,
    Host,
    HostListener,
    Input,
    NgZone,
    OnDestroy,
    Optional,
    Provider,
    ViewContainerRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { defer, fromEvent, merge, Observable, of, Subject, Subscription } from 'rxjs';
import { delay, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { FormFieldComponent } from '../form-field';
import {
    _getItemScrollPosition,
    AutocompleteItemComponent,
    AutocompleteItemSelectionChange,
} from './autocomplete-item.component';
import { AutocompleteComponent } from './autocomplete.component';


export const AUTOCOMPLETE_VALUE_ACCESSOR: Provider = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AutocompleteTriggerDirective),
    multi: true,
};


export const AUTOCOMPLETE_ITEM_HEIGHT = 24;
export const AUTOCOMPLETE_PANEL_HEIGHT = 256;


@Directive({
    selector: 'input[gdAutocompleteTrigger]',
    exportAs: 'gdAutocompleteTrigger',
    providers: [AUTOCOMPLETE_VALUE_ACCESSOR],
    host: {
        '[attr.autocomplete]': '"off"',
        '[attr.role]': 'autocompleteDisabled ? null : "combobox"',
        '[attr.aria-autocomplete]': 'autocompleteDisabled ? null : "list"',
        '[attr.aria-activedescendant]': 'activeItem?.id',
        '[attr.aria-expanded]': 'autocompleteDisabled ? null : panelOpen.toString()',
        '[attr.aria-owns]': '(autocompleteDisabled || !panelOpen) ? null : autocomplete?.id',
    },
})
export class AutocompleteTriggerDirective implements ControlValueAccessor, OnDestroy {
    /* tslint:disable */
    /** `View -> model callback called when value changes` */
    _onChange: (value: any) => void = () => {
    };

    /** `View -> model callback called when autocomplete has been touched` */
    _onTouched = () => {
    };
    /* tslint:enable */

    @Input('gdAutocompleteTrigger') autocomplete: AutocompleteComponent;

    private overlayRef: OverlayRef | null = null;
    private portal: TemplatePortal;
    private componentDestroyed = false;

    /** Strategy that is used to position the panel. */
    private positionStrategy: FlexibleConnectedPositionStrategy;

    /** The subscription for closing actions (some are bound to document). */
    private closingActionsSubscription: Subscription;

    /** Subscription to viewport size changes. */
    private viewportSubscription = Subscription.EMPTY;

    /**
     * Whether the autocomplete can open the next time it is focused. Used to prevent a focused,
     * closed autocomplete from being reopened if the user switches to another browser tab and then
     * comes back.
     */
    private canOpenOnNextFocus = true;

    /** Stream of keyboard events that can close the panel. */
    private readonly closeKeyEventStream = new Subject<void>();

    private _overlayAttached: boolean = false;

    /** Stream of autocomplete item selections. */
    private readonly itemSelections: Observable<AutocompleteItemSelectionChange> = defer(() => {
        if (this.autocomplete && this.autocomplete.items) {
            return merge(...this.autocomplete.items.map(item => item.selectionChanged));
        }

        // If there are any subscribers before `ngAfterViewInit`, the `autocomplete` will be undefined.
        // Return a stream that we'll replace with the real one once everything is in place.
        return this.zone.onStable
            .asObservable()
            .pipe(take(1), switchMap(() => this.itemSelections));
    });

    constructor(
        private elementRef: ElementRef<HTMLInputElement>,
        private overlay: Overlay,
        private viewContainerRef: ViewContainerRef,
        private zone: NgZone,
        private changeDetectorRef: ChangeDetectorRef,
        private viewportRuler: ViewportRuler,
        @Optional() @Host() private formField: FormFieldComponent,
    ) {
    }

    private _autocompleteDisabled = false;

    /**
     * Whether the autocomplete is disabled. When disabled, the element will
     * act as a regular input and the user won't be able to open the panel.
     */
    @Input('gdAutocompleteDisabled')
    get autocompleteDisabled(): boolean {
        return this._autocompleteDisabled;
    }

    set autocompleteDisabled(value: boolean) {
        this._autocompleteDisabled = coerceBooleanProperty(value);
    }

    /** Whether or not the autocomplete panel is open. */
    get panelOpen(): boolean {
        return this._overlayAttached && this.autocomplete.showPanel;
    }

    /** The currently active item, coerced to AutocompleteItem type. */
    get activeItem(): AutocompleteItemComponent | null {
        if (this.autocomplete && this.autocomplete._keyManager) {
            return this.autocomplete._keyManager.activeItem;
        }

        return null;
    }

    /**
     * A stream of actions that should close the autocomplete panel, including
     * when an item is selected, on blur, and when TAB is pressed.
     */
    private get panelClosingActions(): Observable<AutocompleteItemSelectionChange | null> {
        return merge(
            this.itemSelections,
            this.autocomplete._keyManager.tabOut.pipe(filter(() => this._overlayAttached)),
            this.closeKeyEventStream,
            this.getOutsideClickStream(),
            this.overlayRef
                ? this.overlayRef.detachments().pipe(filter(() => this._overlayAttached))
                : of(),
        ).pipe(
            // Normalize the output so we return a consistent type.
            map(event => event instanceof AutocompleteItemSelectionChange ? event : null),
        );
    }

    ngOnDestroy(): void {
        this.viewportSubscription.unsubscribe();
        this.componentDestroyed = true;
        this.destroyPanel();
        this.closeKeyEventStream.complete();
    }

    /** Opens the autocomplete suggestion panel. */
    openPanel(): void {
        this.attachOverlay();
    }

    /** Closes the autocomplete suggestion panel. */
    closePanel(): void {
        if (!this._overlayAttached) {
            return;
        }

        this.autocomplete._isOpen = this._overlayAttached = false;

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

    // Implemented as part of ControlValueAccessor.
    writeValue(value: any): void {
        Promise.resolve(null).then(() => this.setTriggerValue(value));
    }

    // Implemented as part of ControlValueAccessor.
    registerOnChange(fn: (value: any) => {}): void {
        this._onChange = fn;
    }

    // Implemented as part of ControlValueAccessor.
    registerOnTouched(fn: () => {}) {
        this._onTouched = fn;
    }

    // Implemented as part of ControlValueAccessor.
    setDisabledState(isDisabled: boolean) {
        this.elementRef.nativeElement.disabled = isDisabled;
    }

    /** Stream of clicks outside of the autocomplete panel. */
    private getOutsideClickStream(): Observable<any> {
        return merge(
            fromEvent<MouseEvent>(document, 'click'),
            fromEvent<TouchEvent>(document, 'touchend'),
        ).pipe(filter((event) => {
            const clickTarget = event.target as HTMLElement;
            const formField = this.formField ? this.formField.elementRef.nativeElement : null;

            return this._overlayAttached
                && clickTarget !== this.elementRef.nativeElement
                && (!formField || !formField.contains(clickTarget))
                && (!!this.overlayRef && !this.overlayRef.overlayElement.contains(clickTarget));
        }));
    }

    @HostListener('input')
    private handleInput(): void {
        const target = event.target as HTMLInputElement;
        let value: number | string | null = target.value;

        // Based on `NumberValueAccessor` from forms.
        if (target.type === 'number') {
            value = value === '' ? null : parseFloat(value);
        }

        this._onChange(value);

        if (this.canOpen()) {
            this.openPanel();
        }
    }

    @HostListener('keydown', ['$event'])
    _handleKeyDown(event: KeyboardEvent): void {
        const keyCode = event.keyCode;

        // Prevent the default action on all escape key presses. This is here primarily to bring IE
        // in line with other browsers. By default, pressing escape on IE will cause it to revert
        // the input value to the one that it had on focus, however it won't dispatch any events
        // which means that the model value will be out of sync with the view.
        if (keyCode === ESCAPE) {
            event.preventDefault();
        }

        if (this.activeItem && keyCode === ENTER && this.panelOpen) {
            this.activeItem._selectViaInteraction();
            this.resetActiveItem();
            event.preventDefault();
        } else if (this.autocomplete) {
            const prevActiveItem = this.autocomplete._keyManager.activeItem;
            const isArrowKey = keyCode === UP_ARROW || keyCode === DOWN_ARROW;

            if (this.panelOpen || keyCode === TAB) {
                this.autocomplete._keyManager.onKeydown(event);
            } else if (isArrowKey && this.canOpen()) {
                this.openPanel();
            }

            if (isArrowKey || this.autocomplete._keyManager.activeItem !== prevActiveItem) {
                this.scrollToItem();
            }
        }
    }

    @HostListener('focusin')
    private handleFocus(): void {
        if (!this.canOpenOnNextFocus) {
            this.canOpenOnNextFocus = true;
        } else if (this.canOpen()) {
            this.attachOverlay();
        }
    }

    private scrollToItem(): void {
        const index = this.autocomplete._keyManager.activeItemIndex || 0;
        const newScrollPosition = _getItemScrollPosition(
            index,
            AUTOCOMPLETE_ITEM_HEIGHT,
            this.autocomplete._getScrollTop(),
            AUTOCOMPLETE_PANEL_HEIGHT,
        );

        this.autocomplete._setScrollTop(newScrollPosition);
    }

    /**
     * This method listens to a stream of panel closing actions and resets the
     * stream every time the item list changes.
     */
    private subscribeToClosingActions(): Subscription {
        const firstStable = this.zone.onStable.asObservable().pipe(take(1));
        const itemChanges = this.autocomplete.items.changes.pipe(
            tap(() => this.positionStrategy.reapplyLastPosition()),
            // Defer emitting to the stream until the next tick, because changing
            // bindings in here will cause "changed after checked" errors.
            delay(0),
        );

        // When the zone is stable initially, and when the option list changes...
        return merge(firstStable, itemChanges)
            .pipe(
                // create a new stream of panelClosingActions, replacing any previous streams
                // that were created, and flatten it so our stream only emits closing events...
                switchMap(() => {
                    this.resetActiveItem();
                    this.autocomplete._setVisibility();

                    if (this.panelOpen) {
                        this.overlayRef.updatePosition();
                    }

                    return this.panelClosingActions;
                }),
                // when the first closing event occurs...
                take(1),
            )
            // set the value, close the panel, and complete.
            .subscribe(event => this.setValueAndClose(event));
    }

    /** Destroys the autocomplete suggestion panel. */
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

        // Simply falling back to an empty string if the display value is falsy does not work properly.
        // The display value can also be the number zero and shouldn't fall back to an empty string.
        this.elementRef.nativeElement.value = toDisplay !== null ? toDisplay : '';
    }

    /**
     * This method closes the panel, and if a value is specified, also sets the associated
     * control to that value. It will also mark the control as dirty if this interaction
     * stemmed from the user.
     */
    private setValueAndClose(event: AutocompleteItemSelectionChange | null): void {
        if (event && event.source) {
            this.clearPreviousSelectedOption(event.source);
            this.setTriggerValue(event.source.value);
            this._onChange(event.source.value);
            this.elementRef.nativeElement.focus();
        }

        this.closePanel();
    }

    /**
     * Clear any previous selected option and emit a selection change event for this option
     */
    private clearPreviousSelectedOption(skip: AutocompleteItemComponent): void {
        this.autocomplete.items.forEach(option => {
            if (option !== skip && option.selected) {
                option.deselect();
            }
        });
    }

    private attachOverlay(): void {
        if (!this.autocomplete) {
            throw new Error('You should provide autocomplete!');
        }

        if (!this.overlayRef) {
            this.portal = new TemplatePortal(this.autocomplete.template, this.viewContainerRef);
            this.overlayRef = this.overlay.create(this.getOverlayConfig());

            // Use the `keydownEvents` in order to take advantage of
            // the overlay event targeting provided by the CDK overlay.
            this.overlayRef.keydownEvents().subscribe(event => {
                // Close when pressing ESCAPE or ALT + UP_ARROW, based on the a11y guidelines.
                // See: https://www.w3.org/TR/wai-aria-practices-1.1/#textbox-keyboard-interaction
                if (event.keyCode === ESCAPE || (event.keyCode === UP_ARROW && event.altKey)) {
                    this.resetActiveItem();
                    this.closeKeyEventStream.next();
                }
            });

            if (this.viewportRuler) {
                this.viewportSubscription = this.viewportRuler.change().subscribe(() => {
                    if (this.panelOpen && this.overlayRef) {
                        this.overlayRef.updateSize({ width: this.getPanelWidth() });
                    }
                });
            }
        } else {
            // Update the panel width and direction, in case anything has changed.
            this.overlayRef.updateSize({ width: this.getPanelWidth() });
        }

        if (this.overlayRef && !this.overlayRef.hasAttached()) {
            this.overlayRef.attach(this.portal);
            this.closingActionsSubscription = this.subscribeToClosingActions();
        }

        this.autocomplete._setVisibility();
        this.autocomplete._isOpen = this._overlayAttached = true;
    }

    private getOverlayConfig(): OverlayConfig {
        this.positionStrategy = this.overlay.position()
            .flexibleConnectedTo(this.elementRef)
            .withFlexibleDimensions(false)
            .withPush(false)
            .withDefaultOffsetY(1)
            .withPositions([
                {
                    originX: 'start',
                    originY: 'bottom',
                    overlayX: 'start',
                    overlayY: 'top',
                },
                {
                    originX: 'start',
                    originY: 'top',
                    overlayX: 'start',
                    overlayY: 'bottom',
                },
            ]);

        return new OverlayConfig({
            positionStrategy: this.positionStrategy,
            scrollStrategy: this.overlay.scrollStrategies.reposition(),
            width: this.getPanelWidth(),
        });
    }

    private getPanelWidth(): number {
        return this.elementRef.nativeElement.getBoundingClientRect().width;
    }

    /**
     * Resets the active item to -1 so arrow events will activate the correct items.
     */
    private resetActiveItem(): void {
        this.autocomplete._keyManager.setActiveItem(-1);
    }

    /** Determines whether the panel can be opened. */
    private canOpen(): boolean {
        const element = this.elementRef.nativeElement;
        return !element.readOnly && !element.disabled && !this._autocompleteDisabled;
    }
}
