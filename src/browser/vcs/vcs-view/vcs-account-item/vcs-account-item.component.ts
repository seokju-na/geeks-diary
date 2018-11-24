import { FocusableOption } from '@angular/cdk/a11y';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DoCheck,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    Output,
    ViewEncapsulation,
} from '@angular/core';
import { VcsAccount } from '../../../../core/vcs';


@Component({
    selector: 'gd-vcs-account-item',
    templateUrl: './vcs-account-item.component.html',
    styleUrls: ['./vcs-account-item.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'class': 'VcsAccountItem',
        '[class.VcsAccountItem--activated]': 'active',
        '[attr.tabindex]': 'tabIndex',
    },
})
export class VcsAccountItemComponent implements DoCheck, FocusableOption {
    @Input() account: VcsAccount;
    @Input() active: boolean = false;

    @Output() readonly removeThis = new EventEmitter<void>();

    private hovered: boolean = false;

    constructor(
        public _elementRef: ElementRef<HTMLElement>,
        private changeDetectorRef: ChangeDetectorRef,
    ) {
    }

    get tabIndex(): string {
        return this.active ? '0' : '-1';
    }

    get showTools(): boolean {
        return this.hovered || this.active;
    }

    ngDoCheck(): void {
        if (this.account && this.account.email) {
            this.changeDetectorRef.markForCheck();
        }
    }

    focus(): void {
        this._elementRef.nativeElement.focus();
    }

    _onClickRemove(): void {
        this.removeThis.emit();
    }

    @HostListener('mouseenter')
    private handleMouseEnter(): void {
        this.hovered = true;
        this.changeDetectorRef.markForCheck();
    }

    @HostListener('mouseleave')
    private handleMouseLeave(): void {
        this.hovered = false;
        this.changeDetectorRef.markForCheck();
    }
}
