import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { getVcsFileChangeStatusIcon, VcsFileChange } from '../../../../core/vcs';
import { VcsItem, VcsItemConfig, VcsItemRef, VcsItemUpdateCheckedEvent } from '../../../vcs/vcs-view';


@Component({
    selector: 'gd-note-vcs-item',
    templateUrl: './note-vcs-item.component.html',
    styleUrls: ['./note-vcs-item.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'class': 'NoteVcsItem',
    },
})
export class NoteVcsItemComponent extends VcsItem implements OnInit {
    readonly checkFormControl = new FormControl(this._config.checked);

    private checkFormControlSubscription = Subscription.EMPTY;

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private sanitizer: DomSanitizer,
        elementRef: ElementRef<HTMLElement>,
        ref: VcsItemRef<NoteVcsItemComponent>,
        config: VcsItemConfig,
    ) {
        super(elementRef, ref, config);
    }

    get checked(): boolean {
        return this.checkFormControl.value as boolean;
    }

    ngOnInit(): void {
        this.checkFormControlSubscription = this.checkFormControl.valueChanges.subscribe(() => {
            this.emitCheckEvent();
        });
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

    getStatusIconForFileChange(fileChange: VcsFileChange): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(getVcsFileChangeStatusIcon(fileChange.status));
    }

    private emitCheckEvent(): void {
        this.emitEvent(new VcsItemUpdateCheckedEvent(this._ref, {
            checked: this.checkFormControl.value as boolean,
        }));
    }
}
