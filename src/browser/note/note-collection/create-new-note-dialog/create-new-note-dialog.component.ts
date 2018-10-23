import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as path from 'path';
import { Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { makeNoteContentFileName } from '../../../../core/note';
import { datetime } from '../../../../libs/datetime';
import { WorkspaceService } from '../../../shared';
import { DialogRef } from '../../../ui/dialog';
import { NoteError, NoteErrorCodes } from '../../note-errors';
import { NoteCollectionService } from '../note-collection.service';


@Component({
    selector: 'gd-create-new-note-dialog',
    templateUrl: './create-new-note-dialog.component.html',
    styleUrls: ['./create-new-note-dialog.component.scss'],
})
export class CreateNewNoteDialogComponent implements OnInit, OnDestroy {
    readonly createNewNoteFormGroup = new FormGroup({
        title: new FormControl('', [Validators.required]),
        label: new FormControl(''),
    });

    readonly filePathControl = new FormControl('');

    private filePathSettingSubscription = Subscription.EMPTY;

    constructor(
        private dialogRef: DialogRef<CreateNewNoteDialogComponent, void>,
        private workspace: WorkspaceService,
        private collection: NoteCollectionService,
    ) {
    }

    private _createNewNoteProcessing = false;

    get createNewNoteProcessing(): boolean {
        return this._createNewNoteProcessing;
    }

    ngOnInit(): void {
        this.filePathSettingSubscription = this.createNewNoteFormGroup.valueChanges
            .pipe(startWith(null))
            .subscribe(() => this.filePathControl.setValue(this.getFilePath()));
    }

    ngOnDestroy(): void {
        this.filePathSettingSubscription.unsubscribe();
    }

    async createNewNote(): Promise<void> {
        this._createNewNoteProcessing = true;

        const { title, label } = this.createNewNoteFormGroup.value;

        try {
            await this.collection.createNewNote(title, label);
            this.handleCreateNewNoteSuccess();
        } catch (error) {
            this.handleCreateNewNoteFail(error);
        } finally {
            this._createNewNoteProcessing = false;
        }
    }

    close(): void {
        this.dialogRef.close();
    }

    private getFilePath(): string {
        const { title, label } = this.createNewNoteFormGroup.value;
        const fileName = makeNoteContentFileName(datetime.today().getTime(), title as string);

        return path.resolve(
            this.workspace.configs.rootDirPath,
            (label as string) || '',
            fileName,
        );
    }

    private handleCreateNewNoteSuccess(): void {
        this.dialogRef.close();
    }

    private handleCreateNewNoteFail(error: Error): void {
        if (error.name === 'NoteError') {
            const code = (error as NoteError).code;

            if (code === NoteErrorCodes.CONTENT_FILE_EXISTS) {
                this.createNewNoteFormGroup.get('title').setErrors({ contentFileExists: true });
            } else if (code === NoteErrorCodes.OUTSIDE_WORKSPACE) {
                this.createNewNoteFormGroup.get('label').setErrors({ outsideWorkspace: true });
            }
        }

        // TODO : Handle unknown error. What should we do in here?
    }
}
