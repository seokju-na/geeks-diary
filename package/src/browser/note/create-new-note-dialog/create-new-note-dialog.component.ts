import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as path from 'path';
import { Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { datetime } from '../../../libs/datetime';
import { makeContentFileName } from '../../../models/note';
import { WorkspaceService } from '../../core/workspace.service';
import { DialogRef } from '../../ui/dialog/dialog-ref';
import { NoteCollectionService } from '../shared/note-collection.service';
import { NoteError, NoteErrorCodes } from '../shared/note-errors';


@Component({
    selector: 'gd-create-new-note-dialog',
    templateUrl: './create-new-note-dialog.component.html',
    styleUrls: ['./create-new-note-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class CreateNewNoteDialogComponent implements OnInit, OnDestroy {
    createNewNoteForm = new FormGroup({
        title: new FormControl('', [Validators.required]),
        label: new FormControl(''),
    });

    filePathControl = new FormControl('');

    createNewNoteProcessing = false;

    private formChangesSubscription = Subscription.EMPTY;

    constructor(
        private workspace: WorkspaceService,
        private collection: NoteCollectionService,
        private dialogRef: DialogRef<CreateNewNoteDialogComponent>,
    ) {
    }

    ngOnInit(): void {
        this.formChangesSubscription =
            this.createNewNoteForm.valueChanges
                .pipe(startWith(null))
                .subscribe(() => {
                    this.filePathControl.setValue(this._getFilePath());
                });
    }

    ngOnDestroy(): void {
        this.formChangesSubscription.unsubscribe();
    }

    async createNewNote(): Promise<void> {
        if (this.createNewNoteForm.invalid) {
            return;
        }

        this.createNewNoteProcessing = true;

        const { title, label } = this.createNewNoteForm.value;

        try {
            await this.collection.createNewNote(title, label);
            this.handleCreateNewNoteSuccess();
        } catch (error) {
            this.handleCreateNewNoteFail(error);
        } finally {
            this.createNewNoteProcessing = false;
        }
    }

    private _getFilePath(): string {
        const { title, label } = this.createNewNoteForm.value;

        const fileName = makeContentFileName(datetime.today().getTime(), title);

        return path.resolve(
            this.workspace.configs.rootDirPath,
            label || '',
            fileName,
        );
    }

    private handleCreateNewNoteSuccess(): void {
        this.dialogRef.close();
    }

    private handleCreateNewNoteFail(error: Error): void {
        if (error.name === 'NoteError') {
            const code = (<NoteError>error).code;

            if (code === NoteErrorCodes.CONTENT_FILE_EXISTS) {
                this.createNewNoteForm.get('title').setErrors({ contentFileExists: true });
            } else if (code === NoteErrorCodes.OUTSIDE_WORKSPACE) {
                this.createNewNoteForm.get('label').setErrors({ outsideWorkspace: true });
            }
        }

        // TODO: Handle unknown error
    }
}
