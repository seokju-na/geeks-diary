import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { getVcsFileChangeStatusIcon, VcsFileChangeStatusTypes } from '../../../../core/vcs';
import { VcsItem, VcsItemConfig, VcsItemRef, VcsItemUpdateCheckedEvent } from '../vcs-item';


const fileChangeStatusClassNameMap = {
    [VcsFileChangeStatusTypes.MODIFIED]: 'modified',
    [VcsFileChangeStatusTypes.RENAMED]: 'renamed',
    [VcsFileChangeStatusTypes.NEW]: 'new',
    [VcsFileChangeStatusTypes.REMOVED]: 'removed',
};


@Component({
    selector: 'gd-base-vcs-item',
    templateUrl: './base-vcs-item.component.html',
    styleUrls: ['./base-vcs-item.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'class': 'BaseVcsItem',
    },
})
export class BaseVcsItemComponent extends VcsItem implements OnInit, OnDestroy {
    readonly checkFormControl = new FormControl(this._config.checked);

    private checkFormControlSubscription = Subscription.EMPTY;

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        elementRef: ElementRef<HTMLElement>,
        ref: VcsItemRef<BaseVcsItemComponent>,
        config: VcsItemConfig,
        private sanitizer: DomSanitizer,
    ) {
        super(elementRef, ref, config);

        if (this._config.fileChanges[0]) {
            const className = fileChangeStatusClassNameMap[this._config.fileChanges[0].status];
            const hostEl = this._elementRef.nativeElement;

            hostEl.classList.add(`BaseVcsItem--status-${className}`);
        }
    }

    get checked(): boolean {
        return this.checkFormControl.value as boolean;
    }

    get statusIcon(): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(getVcsFileChangeStatusIcon(this._config.fileChanges[0].status));
    }

    ngOnInit(): void {
        this.checkFormControlSubscription = this.checkFormControl.valueChanges.subscribe(() => {
            this.emitCheckEvent();
        });
    }

    ngOnDestroy(): void {
        this.checkFormControlSubscription.unsubscribe();
    }

    toggle(emitEvent: boolean = true): void {
        this.checkFormControl.setValue(!(this.checkFormControl.value as boolean), { emitEvent });
        this.changeDetectorRef.markForCheck();
    }

    select(emitEvent: boolean = true): void {
        this.checkFormControl.setValue(true, { emitEvent });
        this.changeDetectorRef.markForCheck();
    }

    deselect(emitEvent: boolean = true): void {
        this.checkFormControl.setValue(false, { emitEvent });
        this.changeDetectorRef.markForCheck();
    }

    private emitCheckEvent(): void {
        this.emitEvent(new VcsItemUpdateCheckedEvent(this._ref, {
            checked: this.checkFormControl.value as boolean,
        }));
    }
}
