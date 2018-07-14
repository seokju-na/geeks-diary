import { Directive, HostBinding, HostListener, Input, OnInit } from '@angular/core';
import { DialogRef } from './dialog-ref';


let dialogElementUid = 0;


@Directive({
    selector: 'button[gdDialogClose]',
    host: {
        '[attr.aria-label]': 'ariaLabel',
    },
})
export class DialogCloseDirective {
    @Input() ariaLabel: string = 'Close dialog';
    @Input() dialogResult: any;

    constructor(private dialogRef: DialogRef<any>) {
    }

    @HostListener('click')
    private closeDialog(): void {
        this.dialogRef.close(this.dialogResult);
    }
}


@Directive({
    selector: 'gd-dialog-title',
    host: {
        'class': 'DialogTitle',
    },
})
export class DialogTitleDirective implements OnInit {
    @Input() id = `gd-dialog-title-${dialogElementUid++}`;

    @HostBinding('id')
    private get idName() {
        return this.id;
    }

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
    host: {
        'class': 'DialogContent',
    },
})
export class DialogContentDirective {
}


@Directive({
    selector: 'gd-dialog-actions',
    host: {
        'class': 'DialogActions',
    },
})
export class DialogActionsDirective {
}
