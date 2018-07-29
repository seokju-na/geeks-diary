import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { AuthenticationTypes } from '../../../models/authentication-info';
import { WORKSPACE_DIR_PATH } from '../../../models/workspace';
import { ConfirmDialog } from '../../core/confirm-dialog/confirm-dialog';
import { VcsRemoteService } from '../../vcs/shared/vcs-remote.service';


@Component({
    selector: 'gd-wizard-cloning',
    templateUrl: './wizard-cloning.component.html',
    styleUrls: ['./wizard-cloning.component.scss'],
})
export class WizardCloningComponent implements OnInit {
    @Output() readonly backStep = new EventEmitter<void>();
    @Output() readonly cloneComplete = new EventEmitter<void>();

    remoteUrl = new FormControl('', { updateOn: 'blur' });
    workspaceDirectory = new FormControl(WORKSPACE_DIR_PATH);

    authenticationForm = new FormGroup({
        type: new FormControl(AuthenticationTypes.BASIC),
        userName: new FormControl(''),
        password: new FormControl(''),
        token: new FormControl(''),
    });

    authFormToggled = false;
    loginProcessing = false;
    loginCompleted = false;
    loginErrorCaught = false;
    alreadyLogin = false;

    cloneProcessing = false;

    readonly BASIC_AUTH_TYPE = AuthenticationTypes.BASIC;
    readonly OAUTH2_TOKEN_AUTH_TYPE = AuthenticationTypes.OAUTH2_TOKEN;

    constructor(
        private vcsRemote: VcsRemoteService,
        private confirmDialog: ConfirmDialog,
    ) {

        this.vcsRemote
            .isAuthenticationInfoExists()
            .then(isExists => this.alreadyLogin = isExists);
    }

    get authType(): AuthenticationTypes {
        return this.authenticationForm.get('type').value;
    }

    ngOnInit(): void {
        /**
         * Currently we only have github provider for vcs remote.
         * Later, providers get increased, handling is required.
         */
        this.vcsRemote.setProvider('github');

        /** Set remote url validation. */
        const remoteUrlFormatValidator: ValidatorFn = (control) => {
            if (control.value === '' || control.value.length === 0) {
                return null;
            }

            return this.vcsRemote.isRepositoryUrlValid(control.value)
                ? null
                : { invalidFormat: true };
        };

        this.remoteUrl.setValidators([
            Validators.required,
            remoteUrlFormatValidator,
        ]);
    }

    goToBack(): void {
        this.backStep.emit();
    }

    loginToGithub(): void {
        this.loginProcessing = true;
        this.loginErrorCaught = false;

        const formValue = this.authenticationForm.value;

        switch (this.authType) {
            case this.BASIC_AUTH_TYPE:
                this.vcsRemote
                    .loginWithBasicAuthorization(
                        formValue.userName,
                        formValue.password,
                    )
                    .subscribe(
                        () => this.handleLoginToGithubSuccess(),
                        () => this.handleLoginToGithubFail(),
                    );
                break;

            case this.OAUTH2_TOKEN_AUTH_TYPE:
                this.vcsRemote
                    .loginWithOauth2TokenAuthorization(formValue.token)
                    .subscribe(
                        () => this.handleLoginToGithubSuccess(),
                        () => this.handleLoginToGithubFail(),
                    );
                break;
        }
    }

    toggleAuthForm(): void {
        this.authFormToggled = !this.authFormToggled;
    }

    clone(): void {
        this.cloneProcessing = true;

        this.vcsRemote
            .cloneRepository(this.remoteUrl.value, WORKSPACE_DIR_PATH)
            .subscribe(
                () => this.handleCloneSuccess(),
                error => this.handleCloneFail(error),
            );
    }

    private handleLoginToGithubSuccess(): void {
        this.loginProcessing = false;
        this.loginErrorCaught = false;
        this.loginCompleted = true;
    }

    private handleLoginToGithubFail(): void {
        this.loginProcessing = false;
        this.loginErrorCaught = true;
    }

    private handleCloneSuccess(): void {
        this.cloneComplete.next();
    }

    private handleCloneFail(error: any): void {
        this.cloneProcessing = false;
        this.confirmDialog.openAlert({
            title: 'Error',
            content: error.errorDescription ? error.errorDescription : 'Unknown Error',
        });
    }
}
