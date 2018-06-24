import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { DIALOG_DATA } from '../../../shared/dialog/dialog';
import { DialogRef } from '../../../shared/dialog/dialog-ref';
import { Stack } from '../../../stack/models';
import { StackViewer } from '../../../stack/stack-viewer';
import { NoteEditorSnippetConfig } from '../snippet/snippet';


@Component({
    selector: 'gd-editor-snippet-setting-dialog',
    templateUrl: './snippet-setting-dialog.component.html',
    styleUrls: ['./snippet-setting-dialog.component.less'],
})
export class NoteEditorSnippetSettingDialogComponent implements OnInit {
    settingForm: FormGroup;
    filteredStacks: Observable<Stack[]>;

    constructor(
        @Inject(DIALOG_DATA) readonly data: NoteEditorSnippetConfig,
        private dialogRef: DialogRef<NoteEditorSnippetSettingDialogComponent>,
        private stackViewer: StackViewer,
    ) {
    }

    ngOnInit(): void {
        this.settingForm = new FormGroup({
            language: new FormControl(this.data.language || ''),
            fileName: new FormControl(this.data.fileName || ''),
        });

        this.filteredStacks = this.stackViewer.searchAsObservable(
            this.settingForm.get('language').valueChanges,
        );
    }

    submit(): void {
        this.dialogRef.close(this.settingForm.value);
    }

    cancel(): void {
        this.dialogRef.close();
    }
}
