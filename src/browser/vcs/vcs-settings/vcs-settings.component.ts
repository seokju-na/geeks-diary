import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';
import { VcsAccount, VcsRepositoryNotExistsError } from '../../../core/vcs';
import { toPromise } from '../../../libs/rx';
import { WorkspaceService } from '../../shared';
import { Dialog } from '../../ui/dialog';
import { MenuItem } from '../../ui/menu';
import { VCS_ACCOUNT_DATABASE, VcsAccountDatabase } from '../vcs-account-database';
import { GithubAccountsDialogComponent } from '../vcs-remote';
import { VcsService } from '../vcs.service';


@Component({
    selector: 'gd-vcs-settings',
    templateUrl: './vcs-settings.component.html',
    styleUrls: ['./vcs-settings.component.scss'],
    providers: [Dialog],
})
export class VcsSettingsComponent implements OnInit {
    private _saveRemoteProcessing = false;

    get saveRemoteProcessing(): boolean {
        return this._saveRemoteProcessing;
    }

    get saveRemoteResultMessage(): string {
        switch (this.saveRemoteResult) {
            case 'success':
                return 'Save remote complete';
            case 'fail':
                return 'Fail to save remote';
        }
    }

    readonly remoteSettingForm = new FormGroup({
        githubAccount: new FormControl('', [Validators.required]),
        remoteUrl: new FormControl(''),
    });

    saveRemoteResult: 'success' | 'fail';
    accountMenuItems: MenuItem[] = [];
    private accounts: VcsAccount[] = [];

    constructor(
        private vcs: VcsService,
        private workspace: WorkspaceService,
        private dialog: Dialog,
        @Inject(VCS_ACCOUNT_DATABASE) private accountDB: VcsAccountDatabase,
    ) {
    }

    /* tslint:disable */
    readonly accountMenuConvertFn = (value: VcsAccount): MenuItem => ({
        id: value.email,
        label: `${value.name} <${value.email}>`,
    });

    /* tslint:enable */

    ngOnInit(): void {
        this.vcs.setRemoveProvider('github');

        this.buildRemoteUrlFormControl();
        this.getFetchAccountAndPatchFormValueIfExists();
        this.getRemoteUrlAndPatchFormValueIfExists();
        this.loadAccounts();
    }

    addAccount(): void {
        // Wait for next tick, because before open the dialog, we should
        // release trigger focuses first.
        setTimeout(() => {
            this.dialog.open<GithubAccountsDialogComponent>(
                GithubAccountsDialogComponent,
                {
                    width: '480px',
                    disableBackdropClickClose: true,
                },
            ).afterClosed().subscribe(() => this.loadAccounts());
        }, 0);
    }

    selectAccount(item: MenuItem): void {
        const fetchAccount = this.accounts.find(account => account.email === item.id);
        this.remoteSettingForm.get('githubAccount').patchValue(fetchAccount);
    }

    async saveRemote(): Promise<void> {
        if (this._saveRemoteProcessing) {
            return;
        }

        this._saveRemoteProcessing = true;
        this.saveRemoteResult = null;
        const { githubAccount, remoteUrl } = this.remoteSettingForm.value;

        // Check remote if repository exists.
        try {
            await toPromise(this.vcs.findRemoteRepository(
                remoteUrl as string,
                (githubAccount as VcsAccount).authentication,
            ));
        } catch (error) {
            // Display error message for remote url input.
            if (error instanceof VcsRepositoryNotExistsError) {
                this.remoteSettingForm.get('remoteUrl').setErrors({ repositoryNotExists: true });
            } else {
                // TODO(@seokju-na): How can we handle other errors...?
            }

            this.saveRemoteResult = 'fail';
            this._saveRemoteProcessing = false;
            return;
        }

        // Set remote repository.
        try {
            await toPromise(this.vcs.setRemoteRepository(
                githubAccount as VcsAccount,
                remoteUrl as string,
            ));

            this.saveRemoteResult = 'success';
        } catch (error) {
            this.saveRemoteResult = 'fail';
        } finally {
            this._saveRemoteProcessing = false;
        }
    }

    private buildRemoteUrlFormControl(): void {
        const remoteUrlFormatValidator: ValidatorFn = (control) => {
            if (control.value === '' || control.value.length === 0) {
                return null;
            }

            return this.vcs.isRemoteRepositoryUrlValid(control.value)
                ? null
                : { invalidFormat: true };
        };

        this.remoteSettingForm.get('remoteUrl').setValidators([
            Validators.required,
            remoteUrlFormatValidator,
        ]);
    }

    private getFetchAccountAndPatchFormValueIfExists(): void {
        this.vcs.getRepositoryFetchAccount().pipe(take(1)).subscribe((fetchAccount) => {
            if (fetchAccount) {
                this.remoteSettingForm.get('githubAccount').patchValue(fetchAccount);
            }
        });
    }

    private getRemoteUrlAndPatchFormValueIfExists(): void {
        this.vcs.getRemoteRepositoryUrl().pipe(take(1)).subscribe((remoteUrl) => {
            if (remoteUrl) {
                this.remoteSettingForm.get('remoteUrl').patchValue(remoteUrl);
            }
        });
    }

    private async loadAccounts(): Promise<void> {
        const accounts = await this.accountDB.getAllAccounts();

        this.accounts = accounts;
        this.accountMenuItems = accounts.map(account => ({
            id: account.email,
            label: `${account.name} <${account.email}>`,
        }));
    }
}
