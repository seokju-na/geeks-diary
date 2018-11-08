import { Directive } from '@angular/core';


@Directive({
    selector: 'gd-dialog-content',
    host: {
        'class': 'DialogContent',
    },
})
export class DialogContentDirective {
}
