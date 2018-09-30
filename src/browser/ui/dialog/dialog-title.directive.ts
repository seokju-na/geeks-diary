import { Directive, Input, OnInit, Optional } from '@angular/core';
import { DialogRef } from './dialog-ref';


let uniqueId = 0;


@Directive({
    selector: '[gdDialogTitle]',
})
export class DialogTitleDirective implements OnInit {
    @Input() id = `gd-dialog-title-${uniqueId++}`;

    constructor(@Optional() private dialogRef: DialogRef<any>) {
    }

    ngOnInit(): void {
        if (this.dialogRef && this.dialogRef.componentInstance) {
            Promise.resolve().then(() => {
                const container = this.dialogRef._containerInstance;

                if (container && !container._ariaLabelledBy) {
                    container._ariaLabelledBy = this.id;
                }
            });
        }
    }
}
