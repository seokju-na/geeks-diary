import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { GitError } from '../../../core/git';
import { VcsAuthenticationTypes } from '../../../core/vcs';
import { WorkspaceError } from '../../../core/workspace';
import { WorkspaceService } from '../../shared';
import { ConfirmDialog } from '../../shared/confirm-dialog';
import { VcsService } from '../../vcs';


@Component({
    selector: 'gd-wizard-cloning',
    templateUrl: './wizard-cloning.component.html',
    styleUrls: ['./wizard-cloning.component.scss'],
})
export class WizardCloningComponent implements OnInit {
    readonly remoteUrlFormControl = new FormControl('', { updateOn: 'blur' });
    readonly workspaceDirectoryFormControl = new FormControl('');

    readonly authenticationTypes = VcsAuthenticationTypes;
    readonly authenticationFormGroup = new FormGroup({
        type: new FormControl(this.authenticationTypes.BASIC),
        userName: new FormControl(''),
        password: new FormControl(''),
        token: new FormControl(''),
    });

    private alreadyLogin: boolean = false;
    private _loginSuccess: boolean = false;

    constructor(
        private vcs: VcsService,
        private activatedRoute: ActivatedRoute,
        private confirmDialog: ConfirmDialog,
        private workspace: WorkspaceService,
        private router: Router,
    ) {
    }

    get loginCompleted(): boolean {
        return this.alreadyLogin || this._loginSuccess;
    }

    private _authFormToggled: boolean = false;

    get authFormToggled(): boolean {
        return this._authFormToggled;
    }

    get authFormAvailable(): boolean {
        return !this.alreadyLogin && !this._loginSuccess;
    }

    private _loginProcessing = false;

    get loginProcessing(): boolean {
        return this._loginProcessing;
    }

    private _loginErrorCaught = false;

    get loginErrorCaught(): boolean {
        return this._loginErrorCaught;
    }

    private _cloneProcessing = false;

    get cloneProcessing(): boolean {
        return this._cloneProcessing;
    }

    ngOnInit(): void {
        if (this.activatedRoute.snapshot.data.isAuthenticationInfoExists) {
            this.alreadyLogin = true;
        }

        /**
         * Currently we only have github provider for vcs remote.
         * Later, providers get increased, handling is required.
         */
        this.vcs.setRemoveProvider('github');

        /** Set remote url validation. */
        const remoteUrlFormatValidator: ValidatorFn = (control) => {
            if (control.value === '' || control.value.length === 0) {
                return null;
            }

            return this.vcs.isRemoteRepositoryUrlValid(control.value)
                ? null
                : { invalidFormat: true };
        };

        this.remoteUrlFormControl.setValidators([
            Validators.required,
            remoteUrlFormatValidator,
        ]);

        this.workspaceDirectoryFormControl.patchValue(this.workspace.configs.rootDirPath);
    }

    goToBack(): void {
        this.router.navigate(['/']);
    }

    toggleAuthForm(): void {
        this._authFormToggled = !this._authFormToggled;
    }

    loginToVcsRemote(): void {
        this._loginProcessing = true;
        this._loginErrorCaught = false;

        const { type, userName, password, token } = this.authenticationFormGroup.value as any;

        switch (type as VcsAuthenticationTypes) {
            case VcsAuthenticationTypes.BASIC:
                this.vcs
                    .loginRemoteWithBasicAuthorization(
                        userName as string,
                        password as string,
                    )
                    .pipe(finalize(() => this._loginProcessing = false))
                    .subscribe(
                        () => this.handleLoginToVcsRemoteSuccess(),
                        () => this.handleLoginToVcsRemoteFail(),
                    );
                break;

            case VcsAuthenticationTypes.OAUTH2_TOKEN:
                this.vcs
                    .loginRemoteWithOauth2TokenAuthorization(token as string)
                    .pipe(finalize(() => this._loginProcessing = false))
                    .subscribe(
                        () => this.handleLoginToVcsRemoteSuccess(),
                        () => this.handleLoginToVcsRemoteFail(),
                    );
                break;
        }
    }

    clone(): void {
        this._cloneProcessing = true;

        this.vcs.cloneRepository(
            this.remoteUrlFormControl.value,
            this.workspace.configs.rootDirPath,
        ).subscribe(
            () => {
                this.workspace.initWorkspace().subscribe(
                    // Main process will open app window after init workspace.
                    () => this._cloneProcessing = false,
                    error => this.handleWorkspaceInitFail(error),
                );
            },
            (error) => {
                this._cloneProcessing = false;
                this.handleCloneFail(error);
            },
        );
    }

    private handleLoginToVcsRemoteSuccess(): void {
        // this.loginErrorCaught = false;
        this._loginSuccess = true;
    }

    private handleLoginToVcsRemoteFail(): void {
        this._loginErrorCaught = true;
    }

    private handleCloneFail(error: any): void {
        this.confirmDialog.open({
            isAlert: true,
            title: 'Git Error',
            body: (error as GitError).errorDescription,
        });
    }

    private handleWorkspaceInitFail(error: any): void {
        this.confirmDialog.open({
            isAlert: true,
            title: 'Workspace Error',
            body: (error as WorkspaceError).message,
        });
    }
}
