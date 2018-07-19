import { FocusableOption } from '@angular/cdk/a11y';
import { ENTER, SPACE } from '@angular/cdk/keycodes';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewEncapsulation,
} from '@angular/core';
import { NoteCollectionViewModes } from '../shared/note-collection.state';
import { NoteItem } from '../shared/note-item.model';


export class NoteItemSelectionChange {
    constructor(
        public source: NoteItemComponent,
        public isUserInput = false,
    ) {
    }
}


@Component({
    selector: 'gd-note-item',
    templateUrl: './note-item.component.html',
    styleUrls: ['./note-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        'class': 'NoteItem',
        '[class.NoteItem--activated]': 'active',
        '[class.NoteItem--selected]': 'selected',
        '[attr.aria-selected]': 'selected',
        '[attr.tabindex]': 'tabIndex',
    },
})
export class NoteItemComponent implements OnInit, OnDestroy, FocusableOption {
    @Input() viewMode: NoteCollectionViewModes;
    @Input() note: NoteItem;
    @Input() active: boolean;
    @Input() selected: boolean;

    @Output() readonly selectionChange = new EventEmitter<NoteItemSelectionChange>();

    get tabIndex(): string {
        return this.active ? '0' : '-1';
    }

    constructor(
        public _elementRef: ElementRef,
    ) {
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
    }

    focus(): void {
        this._elementRef.nativeElement.focus();
    }

    @HostListener('keydown', ['$event'])
    _handleKeyDown(event: KeyboardEvent): void {
        if (event.keyCode === ENTER || event.keyCode === SPACE) {
            this.emitSelectionChange(true);
        }
    }

    @HostListener('click')
    _handleClick(): void {
        this.emitSelectionChange(true);
    }

    private emitSelectionChange(isUserInput = false): void {
        this.selectionChange.emit(new NoteItemSelectionChange(this, isUserInput));
    }
}
