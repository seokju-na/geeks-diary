import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component, ElementRef, EventEmitter, Input, Output
} from '@angular/core';
import { KeyCodes } from '../../../common/key-codes';


let uniqueIdCounter = 0;

export class OptionItemSelectionChange {
    constructor(
        public source: OptionItemComponent,
        public isUserInput) {}
}


@Component({
    selector: 'gd-option-item',
    templateUrl: './option-item.component.html',
    styleUrls: ['./option-item.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptionItemComponent {
    private _selected = false;
    private _active = false;
    private _disabled = false;

    readonly id = `OptionItem-${uniqueIdCounter++}`;

    @Input() value: any;
    @Input()
    get disabled() { return this._disabled; }
    set disabled(value: any) {
        this._disabled = coerceBooleanProperty(value);
    }

    @Output() selectionChange = new EventEmitter<OptionItemSelectionChange>();

    constructor(
        private elementRef: ElementRef,
        private changeDetectorRef: ChangeDetectorRef) {}

    get selected(): boolean {
        return this._selected;
    }

    get active(): boolean {
        return this._active;
    }

    select(): void {
        this._selected = true;
        this.changeDetectorRef.markForCheck();
        this.emitSelectionChangeEvent();
    }

    deselect(): void {
        this._selected = false;
        this.changeDetectorRef.markForCheck();
        this.emitSelectionChangeEvent();
    }

    focus(): void {
        const element = this.elementRef.nativeElement;

        if (typeof element.focus === 'function') {
            element.focus();
        }
    }

    setActiveStyles(): void {
        if (!this._active) {
            this._active = true;
            this.changeDetectorRef.markForCheck();
        }
    }

    setInactiveStyles(): void {
        if (this._active) {
            this._active = false;
            this.changeDetectorRef.markForCheck();
        }
    }

    selectViaInteraction(): void {
        this._selected = true;
        this.changeDetectorRef.markForCheck();
        this.emitSelectionChangeEvent(true);
    }

    handleKeydown(event: KeyboardEvent): void {
        if (event.keyCode === KeyCodes.ENTER || event.keyCode === KeyCodes.SPACE) {
            this.selectViaInteraction();
            event.preventDefault();
        }
    }

    private emitSelectionChangeEvent(isUserInput = false): void {
        this.selectionChange.emit(new OptionItemSelectionChange(this, isUserInput));
    }
}
