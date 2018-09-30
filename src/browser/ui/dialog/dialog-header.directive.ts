import { Directive } from '@angular/core';


@Directive({
    selector: 'gd-dialog-header',
    host: {
        'class': 'DialogHeader',
    },
})
export class DialogHeaderDirective {
}
