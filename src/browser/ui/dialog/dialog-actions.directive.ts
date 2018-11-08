import { Directive, Input } from '@angular/core';


export type DialogActionsAlign = 'start' | 'center' | 'end';


@Directive({
    selector: 'gd-dialog-actions',
    host: {
        'class': 'DialogActions',
        '[class.DialogActions--align-start]': 'align === "start"',
        '[class.DialogActions--align-end]': 'align === "end"',
        '[class.DialogActions--align-center]': 'align === "center"',
    },
})
export class DialogActionsDirective {
    @Input() align: DialogActionsAlign = 'start';
}
