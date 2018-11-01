import { Component, Inject, OnDestroy, OnInit, Optional } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as path from 'path';
import { of, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { DIALOG_DATA, DialogRef } from '../../ui/dialog';
import { FsService } from '../fs.service';
import { ChangeFileNameDialogData } from './change-file-name-dialog-data';
import { ChangeFileNameDialogResult } from './change-file-name-dialog-result';


@Component({
    selector: 'gd-file-name-change-dialog',
    templateUrl: './change-file-name-dialog.component.html',
    styleUrls: ['./change-file-name-dialog.component.scss'],
})
export class ChangeFileNameDialogComponent implements OnInit, OnDestroy {
    readonly formGroup = new FormGroup({
        fileName: new FormControl('', {
            validators: [Validators.required],
            updateOn: 'blur',
        }),
        directory: new FormControl(''),
    });

    private directoryChangeSubscription = Subscription.EMPTY;

    constructor(
        private dialogRef: DialogRef<ChangeFileNameDialogComponent, ChangeFileNameDialogResult>,
        @Optional() @Inject(DIALOG_DATA) public data: ChangeFileNameDialogData,
        private fs: FsService,
    ) {
    }

    ngOnInit(): void {
        if (this.data && this.data.fileName) {
            (this.formGroup.get('fileName') as FormControl).setValue(this.data.fileName, { emitEvent: false });
        }

        // Set async validator for checking file name duplication in directory.
        this.formGroup.get('fileName').setAsyncValidators((control) => {
            const value = control.value as string;

            if (!value) {
                return of(null);
            }

            return this.fs.readDirectory(this.data.directoryPath).pipe(
                map(fileNames => fileNames.includes(value) ? { fileAlreadyExists: true } : null),
            );
        });

        this.directoryChangeSubscription = (this.formGroup.get('fileName') as FormControl).valueChanges
            .pipe(startWith(this.formGroup.get('fileName').value as string))
            .subscribe((fileName) => {
                (this.formGroup.get('directory') as FormControl).setValue(
                    path.resolve(this.data.directoryPath, fileName),
                    { emitEvent: false },
                );
            });
    }

    ngOnDestroy(): void {
        this.directoryChangeSubscription.unsubscribe();
    }

    closeThisDialog(): void {
        this.dialogRef.close();
    }

    submit(): void {
        if (this.formGroup.pending || this.formGroup.invalid) {
            return;
        }

        this.dialogRef.close({
            isChanged: true,
            changedFileName: this.formGroup.get('fileName').value as string,
        });
    }
}
