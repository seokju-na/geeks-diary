import { ChangeDetectionStrategy, Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Stack } from '../../../stack/models';
import { StackViewer } from '../../../stack/stack-viewer';
import { UpdateStacksAction } from '../../actions';
import { NoteStateWithRoot } from '../../reducers';


@Component({
    selector: 'gd-note-editor-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteEditorToolbarComponent {
    stacks: Observable<Stack[]>;

    constructor(
        private store: Store<NoteStateWithRoot>,
        private stackViewer: StackViewer,
    ) {

        this.stacks = this.store.pipe(
            select(state => state.note.editor.selectedNoteContent),
            map(selectedNoteContent =>
                selectedNoteContent
                    ? this.stackViewer.getStackCollection(selectedNoteContent.stacks)
                    : [],
            ),
        );
    }

    updateStacks(stacks: Stack[]): void {
        this.store.dispatch(new UpdateStacksAction({
            stacks: stacks.map(stack => stack.name),
        }));
    }
}
