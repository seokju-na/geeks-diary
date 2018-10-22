/**
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    Input,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { AutocompleteItemComponent } from './autocomplete-item.component';


let uniqueId = 0;


@Component({
    selector: 'gd-autocomplete',
    templateUrl: './autocomplete.component.html',
    styleUrls: ['./autocomplete.component.scss'],
    exportAs: 'gdAutocomplete',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'class': 'Autocomplete',
    },
})
export class AutocompleteComponent implements AfterContentInit {
    /** Manages active item in option list based on key events. */
    _keyManager: ActiveDescendantKeyManager<AutocompleteItemComponent>;

    /** Whether the autocomplete panel should be visible, depending on option length. */
    showPanel: boolean = false;

    @ViewChild(TemplateRef) template: TemplateRef<any>;

    /** Element for the panel containing the autocomplete options. */
    @ViewChild('panel') panel: ElementRef<HTMLElement>;

    @ContentChildren(AutocompleteItemComponent) items: QueryList<AutocompleteItemComponent>;

    /** Function that maps an option's control value to its display value in the trigger. */
    @Input() displayWith: ((value: any) => string) | null = null;

    /** Unique ID to be used by autocomplete trigger's "aria-owns" property. */
    id: string = `gd-autocomplete-${uniqueId++}`;

    constructor(private changeDetectorRef: ChangeDetectorRef) {
    }

    _isOpen: boolean = false;

    /** Whether the autocomplete panel is open. */
    get isOpen(): boolean {
        return this._isOpen && this.showPanel;
    }

    ngAfterContentInit(): void {
        this._keyManager = new ActiveDescendantKeyManager<AutocompleteItemComponent>(this.items).withWrap();
        // Set the initial visibility state.
        this._setVisibility();
    }

    /**
     * Sets the panel scrollTop. This allows us to manually scroll to display options
     * above or below the fold, as they are not actually being focused when active.
     */
    _setScrollTop(scrollTop: number): void {
        if (this.panel) {
            this.panel.nativeElement.scrollTop = scrollTop;
        }
    }

    /** Returns the panel's scrollTop. */
    _getScrollTop(): number {
        return this.panel ? this.panel.nativeElement.scrollTop : 0;
    }

    /** Panel should hide itself when the option list is empty. */
    _setVisibility(): void {
        this.showPanel = !!this.items.length;
        this.changeDetectorRef.markForCheck();
    }
}
