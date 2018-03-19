/**
 * This is hard replica of material2's autocomplete.
 * All source are from google's material2 project.
 * See https://github.com/angular/material2/tree/master/src/lib/autocomplete.
 */
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    QueryList,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { OptionItemComponent } from '../option-item/option-item.component';


export class AutocompleteSelectedEvent {
    constructor(public source: AutocompleteComponent,
                public option: OptionItemComponent) {
    }
}


@Component({
    selector: 'gd-autocomplete',
    templateUrl: './autocomplete.component.html',
    styleUrls: ['./autocomplete.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'gdAutocomplete',
})
export class AutocompleteComponent implements AfterContentInit {
    _keyManager: ActiveDescendantKeyManager<OptionItemComponent>;
    showPanel = false;

    get isOpen(): boolean {
        return this._isOpen && this.showPanel;
    }

    _isOpen = false;

    @ViewChild(TemplateRef) template: TemplateRef<any>;
    @ViewChild('panel') panel: ElementRef;

    @ContentChildren(OptionItemComponent, { descendants: true })
    options: QueryList<OptionItemComponent>;

    @Input() displayWith: ((value: any) => string) | null = null;
    @Output() optionSelected = new EventEmitter<AutocompleteSelectedEvent>();

    constructor(private changeDetectorRef: ChangeDetectorRef) {
    }

    ngAfterContentInit(): void {
        this._keyManager = new ActiveDescendantKeyManager<OptionItemComponent>(this.options);
        this._setVisibility();
    }

    _setScrollTop(scrollTop: number): void {
        if (this.panel) {
            this.panel.nativeElement.scrollTop = scrollTop;
        }
    }

    _getScrollTop(): number {
        return this.panel ? this.panel.nativeElement.scrollTop : 0;
    }

    _setVisibility(): void {
        this.showPanel = !!this.options.length;
        this.changeDetectorRef.markForCheck();
    }

    _emitSelectEvent(option: OptionItemComponent): void {
        this.optionSelected.emit(new AutocompleteSelectedEvent(this, option));
    }
}
