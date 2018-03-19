import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { StackItem, StackViewer } from '../../stack/stack-viewer';


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

    constructor(private stackViewer: StackViewer) {
    }

    getStackItemDummies(): Observable<StackItem[]> {
        return this.stackViewer.search(of('java'));
    }
}
