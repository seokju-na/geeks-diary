import { Directive, Input } from '@angular/core';


export type DialogActionsAlign = 'center' | 'left' | 'right';


@Directive({
    selector: 'gd-dialog-actions',
    host: {
        'class': 'DialogActions',
        '[class.DialogActions--align-left]': 'align === "left"',
        '[class.DialogActions--align-right]': 'align === "right"',
        '[class.DialogActions--align-center]': 'align === "center"',
    },
})
export class DialogActionsDirective {
    @Input() align: DialogActionsAlign = 'left';
}
