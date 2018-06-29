import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { DialogRef } from '../../shared/dialog/dialog-ref';
import { WorkspaceService } from '../workspace.service';


@Component({
    selector: 'gd-workspace-init-dialog',
    templateUrl: './workspace-init-dialog.component.html',
    styleUrls: ['./workspace-init-dialog.component.less'],
})
export class WorkspaceInitDialogComponent implements OnInit, OnDestroy {
    initializeForm = new FormGroup({
        method: new FormControl('createNew', [Validators.required]),
        remoteUrl: new FormControl(''),
    });

    initializeMethods = {
        CREATE_NEW: 'createNew',
        CLONE_REMOTE: 'cloneRemote',
    };

    loading = false;
    workingProcess: string;

    private initMethodValueChangesSubscription: Subscription;

    constructor(
        private workspaceService: WorkspaceService,
        private dialogRef: DialogRef<WorkspaceInitDialogComponent>,
    ) {
    }

    ngOnInit(): void {
        this.initMethodValueChangesSubscription =
            this.initializeForm.get('method').valueChanges
                .pipe(startWith('createNew'))
                .subscribe((value) => {
                    this.handleInitMethodChanges(value);
                });
    }

    ngOnDestroy(): void {
        if (this.initMethodValueChangesSubscription) {
            this.initMethodValueChangesSubscription.unsubscribe();
        }
    }

    get submitButtonString(): string {
        // Skip for 'createNew' process, because it process super fast.
        if (this.loading && this.workingProcess === 'cloneRemote') {
            return 'Cloning from remote';
        }

        return 'OK';
    }

    async initializeWorkspace(): Promise<void> {
        const value = this.initializeForm.value;

        if (value.method === 'cloneRemote'
            && this.initializeForm.get('remoteUrl').hasError('required')) {
            return;
        }

        this.workingProcess = value.method;
        this.loading = true;
        this.initializeForm.get('remoteUrl').disable();

        try {
            switch (value.method) {
                case 'createNew':
                    await this.workspaceService.createWorkspaceRepository();
                    break;
                case 'cloneRemote':
                    await this.workspaceService.cloneRemoteRepository(value.remoteUrl);
                    break;
            }

            this.dialogRef.close();
        } catch (error) {
            this.workingProcess = null;
            this.loading = false;
            this.initializeForm.get('remoteUrl').enable();

            this.handleWorkspaceInitError(error);
        }
    }

    private handleInitMethodChanges(methodName: string): void {
        const remoteUrlControl = this.initializeForm.get('remoteUrl');

        switch (methodName) {
            case 'createNew':
                remoteUrlControl.disable();
                remoteUrlControl.clearValidators();
                break;

            case 'cloneRemote':
                remoteUrlControl.enable();
                remoteUrlControl.setValidators([Validators.required]);
                break;
        }
    }

    private handleWorkspaceInitError(error: any): void {
        if (error.code === 'CONNECTION_ERROR') {
            this.initializeForm.get('remoteUrl').setErrors({
                connectionError: true,
            });
        } else if (error.code === 'AUTHENTICATION_FAIL') {
            this.initializeForm.get('remoteUrl').setErrors({
                authenticationFail: true,
            });
        }
    }

}
