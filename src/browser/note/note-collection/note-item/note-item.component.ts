import { FocusableOption } from '@angular/cdk/a11y';
import { ENTER, SPACE } from '@angular/cdk/keycodes';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
    ViewEncapsulation,
} from '@angular/core';
import { NoteItem } from '../note-item.model';


export class NoteItemSelectionChange {
    constructor(
        public readonly source: NoteItemComponent,
        public readonly isUserInput = false,
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
export class NoteItemComponent implements OnInit, FocusableOption {
    @Input() note: NoteItem;
    @Input() active: boolean;
    @Input() selected: boolean;

    @Output() readonly selectionChange = new EventEmitter<NoteItemSelectionChange>();

    constructor(public _elementRef: ElementRef<HTMLElement>) {
    }

    get tabIndex(): string {
        return this.active ? '0' : '-1';
    }

    ngOnInit(): void {
    }

    focus(): void {
        this._elementRef.nativeElement.focus();
    }

    @HostListener('keydown', ['$event'])
    private handleKeyDown(event: KeyboardEvent): void {
        if (event.keyCode === ENTER || event.keyCode === SPACE) {
            this.emitSelectionChange(true);
        }
    }

    @HostListener('click')
    private handleClick(): void {
        this.emitSelectionChange(true);
    }

    private emitSelectionChange(isUserInput = false): void {
        this.selectionChange.emit(new NoteItemSelectionChange(this, isUserInput));
    }
}
