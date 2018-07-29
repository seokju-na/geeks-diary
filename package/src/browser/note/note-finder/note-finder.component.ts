import { Component, OnInit } from '@angular/core';
import { Dialog } from '../../ui/dialog/dialog';
import { CreateNewNoteDialogComponent } from '../create-new-note-dialog/create-new-note-dialog.component';


@Component({
    selector: 'gd-note-finder',
    templateUrl: './note-finder.component.html',
    styleUrls: ['./note-finder.component.scss'],
})
export class NoteFinderComponent implements OnInit {

    constructor(private dialog: Dialog) {
    }

    ngOnInit(): void {
    }

    openCreateNewNoteDialog(): void {
        this.dialog.open(CreateNewNoteDialogComponent, {
            disableBackdropClickClose: true,
        });
    }
}
