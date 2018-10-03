import { Component } from '@angular/core';
// noinspection TypeScriptPreferShortImport
import { CreateNewNoteDialogComponent } from '../create-new-note-dialog/create-new-note-dialog.component';
import { Dialog } from '../../../ui/dialog';


@Component({
    selector: 'gd-note-finder',
    templateUrl: './note-finder.component.html',
    styleUrls: ['./note-finder.component.scss'],
})
export class NoteFinderComponent {
    constructor(private dialog: Dialog) {
    }

    openCreateNewNoteDialog(): void {
        this.dialog.open<CreateNewNoteDialogComponent>(CreateNewNoteDialogComponent, {
            width: '460px',
            disableBackdropClickClose: true,
        });
    }
}
