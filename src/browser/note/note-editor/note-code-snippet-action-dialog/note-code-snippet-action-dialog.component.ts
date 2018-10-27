import { Component, Inject, OnDestroy, OnInit, Optional } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Stack, StackViewer } from '../../../stack';
import { DIALOG_DATA, DialogRef } from '../../../ui/dialog';
import { NoteCodeSnippetActionDialogResult } from './note-code-snippet-action-dialog-result';
import { NoteCodeSnippetActionDialogData } from './note-code-snippet-action-dialog-data';


@Component({
    selector: 'gd-note-code-snippet-action-dialog',
    templateUrl: './note-code-snippet-action-dialog.component.html',
    styleUrls: ['./note-code-snippet-action-dialog.component.scss'],
})
export class NoteCodeSnippetActionDialogComponent implements OnInit, OnDestroy {
    readonly manipulatingFormGroup = new FormGroup({
        language: new FormControl(''),
        fileName: new FormControl(''),
    });

    languageStacks: Stack[] = [];

    private languageValueChangeSubscription = Subscription.EMPTY;

    constructor(
        private dialogRef: DialogRef<NoteCodeSnippetActionDialogComponent,
            NoteCodeSnippetActionDialogResult>,
        @Optional() @Inject(DIALOG_DATA) public data: NoteCodeSnippetActionDialogData,
        private stackViewer: StackViewer,
    ) {
    }

    get dialogTitle(): string {
        if (this.data && this.data.actionType === 'create') {
            return 'Add code snippet';
        } else if (this.data && this.data.actionType === 'edit') {
            return 'Edit code snippet';
        }
    }

    get actionButtonString(): string {
        if (this.data && this.data.actionType === 'create') {
            return 'Create';
        } else if (this.data && this.data.actionType === 'edit') {
            return 'Save';
        }
    }

    ngOnInit(): void {
        if (this.data && this.data.actionType === 'edit') {
            this.manipulatingFormGroup.patchValue({
                language: this.data.codeLanguageId,
                fileName: this.data.codeFileName,
            });
        }

        this.languageValueChangeSubscription =
            this.manipulatingFormGroup.get('language').valueChanges.pipe(
                debounceTime(50),
            ).subscribe((value) => {
                this.languageStacks = this.stackViewer
                    .search(value as string)
                    .filter(stack => !!stack.languageId); // Search only language.
            });
    }

    ngOnDestroy(): void {
        this.languageValueChangeSubscription.unsubscribe();
    }

    submit(): void {
        const value: { language: string, fileName: string } = this.manipulatingFormGroup.value;

        this.dialogRef.close({
            codeLanguageId: value.language,
            codeFileName: value.fileName,
        });
    }

    closeThisDialog(): void {
        this.dialogRef.close();
    }
}
