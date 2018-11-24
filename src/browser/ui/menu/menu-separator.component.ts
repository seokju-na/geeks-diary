import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';


@Component({
    selector: 'gd-menu-separator',
    template: '',
    styleUrls: ['./menu-separator.component.scss'],
    host: {
        'class': 'MenuSeparator',
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuSeparatorComponent {
}
