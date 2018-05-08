import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Stack } from '../../stack/models';
import { StackViewer } from '../../stack/stack-viewer';
import { NoteMetadata } from '../models';


@Component({
    selector: 'a[gd-note-item]',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteItemComponent {
    @Input()
    get note() {
        return this._note;
    }
    set note(note: any) {
        if (!note) {
            return;
        }

        this._note = note;
        this.getStacks();
    }

    @Input() status = 'none';
    @Input() selected = false;

    stacks: Stack[] = [];
    private _note: NoteMetadata;

    constructor(private stackViewer: StackViewer) {
    }

    private getStacks(): void {
        this.stacks = this._note.stacks
            .map(name => this.stackViewer.getStack(name))
            .filter(stack => stack !== null);
    }
}
