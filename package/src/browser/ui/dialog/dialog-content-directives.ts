import { Directive, HostBinding, HostListener, Input, OnInit } from '@angular/core';
import { DialogRef } from './dialog-ref';


let dialogElementUid = 0;


@Directive({
    selector: 'button[gdDialogClose]',
})
export class DialogCloseDirective {
    @Input() ariaLabel: string = 'Close dialog';
    @Input() dialogResult: any;

    @HostBinding('attr.aria-label')
    get ariaLabelAttr() {
        return this.ariaLabel;
    }

    constructor(private dialogRef: DialogRef<any>) {
    }

    @HostListener('click')
    private closeDialog(): void {
        this.dialogRef.close(this.dialogResult);
    }
}


@Directive({
    selector: '[gdDialogTitle]',
})
export class DialogTitleDirective implements OnInit {
    @Input() id = `gd-dialog-title-${dialogElementUid++}`;

    @HostBinding('id')
    private get idName() {
        return this.id;
    }

    @HostBinding('class.DialogTitle') private className = true;

    constructor(private dialogRef: DialogRef<any>) {
    }

    ngOnInit() {
        if (this.dialogRef) {
            Promise.resolve().then(() => {
                const container = this.dialogRef._containerInstance;

                if (container && !container._ariaLabelledBy) {
                    container._ariaLabelledBy = this.id;
                }
            });
        }
    }
}


@Directive({
    selector: 'gd-dialog-content',
})
export class DialogContentDirective {
    @HostBinding('class.DialogContent') private className = true;
}


@Directive({
    selector: 'gd-dialog-actions',
})
export class DialogActionsDirective {
    @HostBinding('class.DialogActions') private className = true;
}

