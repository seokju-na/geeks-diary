import { Injectable } from '@angular/core';
import { Dialog, DialogRef } from '../../../ui/dialog';
import { NoteCodeSnippetActionDialogData } from './note-code-snippet-action-dialog-data';
import { NoteCodeSnippetActionDialogResult } from './note-code-snippet-action-dialog-result';
import { NoteCodeSnippetActionDialogComponent } from './note-code-snippet-action-dialog.component';


@Injectable()
export class NoteCodeSnippetActionDialog {
    constructor(private dialog: Dialog) {
    }

    open(data: NoteCodeSnippetActionDialogData): DialogRef<NoteCodeSnippetActionDialogComponent,
        NoteCodeSnippetActionDialogResult> {
        return this.dialog.open<NoteCodeSnippetActionDialogComponent,
            NoteCodeSnippetActionDialogData,
            NoteCodeSnippetActionDialogResult>(
            NoteCodeSnippetActionDialogComponent,
            {
                width: '360px',
                data,
            },
        );
    }
}
