import { ChangeDetectionStrategy, Component } from '@angular/core';


@Component({
    selector: 'a[gd-note-item]',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteItemComponent {
}
