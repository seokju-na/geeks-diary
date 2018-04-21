import { ChangeDetectionStrategy, Component, Input } from '@angular/core';


@Component({
    selector: 'a[gd-note-item]',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteItemComponent {
    // FIXME LATER : Should pass note item model.
    @Input() status = 'none';
    @Input() selected = false;
}
