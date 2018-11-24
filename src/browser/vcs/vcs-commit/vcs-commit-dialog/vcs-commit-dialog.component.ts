import {
    AfterViewInit,
    Component,
    ElementRef,
    Inject,
    OnInit,
    Optional,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { finalize } from 'rxjs/operators';
import { VcsAccount, VcsError } from '../../../../core/vcs';
import { GitService, WorkspaceService } from '../../../shared';
import { Dialog, DIALOG_DATA, DialogRef } from '../../../ui/dialog';
import { MenuItem } from '../../../ui/menu';
import { VCS_ACCOUNT_DATABASE, VcsAccountDatabase } from '../../vcs-account-database';
import { GithubAccountsDialogComponent } from '../../vcs-remote';
import { VCS_ITEM_LIST_MANAGER, VcsItemListManager, VcsItemListManagerFactory } from '../../vcs-view';
import { CommittedAction } from '../../vcs.actions';
import { VcsStateWithRoot } from '../../vcs.state';
import { VcsCommitDialogData } from './vcs-commit-dialog-data';
import { VcsCommitDialogResult } from './vcs-commit-dialog-result';


@Component({
    selector: 'gd-vcs-commit-dialog',
    templateUrl: './vcs-commit-dialog.component.html',
    styleUrls: ['./vcs-commit-dialog.component.scss'],
    providers: [Dialog],
})
export class VcsCommitDialogComponent implements OnInit, AfterViewInit {
    @ViewChild('itemList') _itemList: ElementRef<HTMLElement>;

    readonly commitFormGroup = new FormGroup({
        author: new FormControl(null, [Validators.required]),
        summary: new FormControl('', [Validators.required, Validators.maxLength(72)]),
        description: new FormControl(''),
    });

    authorMenuItems: MenuItem[] = [];
    private itemListManager: VcsItemListManager;
    private accounts: VcsAccount[] = [];

    constructor(
        @Inject(VCS_ITEM_LIST_MANAGER) private itemListManagerFactory: VcsItemListManagerFactory,
        private viewContainerRef: ViewContainerRef,
        @Optional() @Inject(DIALOG_DATA) public data: VcsCommitDialogData,
        private dialog: Dialog,
        private dialogRef: DialogRef<VcsCommitDialogComponent, VcsCommitDialogResult>,
        @Inject(VCS_ACCOUNT_DATABASE) private accountDB: VcsAccountDatabase,
        private workspace: WorkspaceService,
        private git: GitService,
        private store: Store<VcsStateWithRoot>,
    ) {
    }

    private _commitProcessing = false;

    get commitProcessing(): boolean {
        return this._commitProcessing;
    }

    get selectedItemsCount(): number {
        if (this.itemListManager) {
            return this.itemListManager._selectedItems.size;
        } else {
            return 0;
        }
    }

    /* tslint:disable */
    readonly authorMenuConvertFn = (value: VcsAccount): MenuItem => ({
        id: value.email,
        label: `${value.name} <${value.email}>`,
    });
    /* tslint:enable */

    ngOnInit(): void {
        if (!(this.data && this.data.fileChanges)) {
            throw new Error('Please input file changes.');
        }

        this.loadAccounts();
    }

    ngAfterViewInit(): void {
        this.itemListManager = this.itemListManagerFactory(this._itemList.nativeElement, this.viewContainerRef);

        // Next tick
        Promise.resolve(null).then(() => {
            this.itemListManager.initWithFileChanges(this.data.fileChanges);
            this.itemListManager.selectAllItems();
        });
    }

    selectAuthor(item: MenuItem): void {
        const author = this.accounts.find(account => account.email === item.id);
        this.commitFormGroup.get('author').patchValue(author);
    }

    addAuthor(): void {
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

    commit(): void {
        if (this.commitFormGroup.invalid || this._commitProcessing || this.selectedItemsCount === 0) {
            return;
        }

        const { author, summary, description } = this.commitFormGroup.value;
        this._commitProcessing = true;

        this.git.commit(
            this.workspace.configs.rootDirPath,
            author as VcsAccount,
            { summary, description },
            this.getFilesToAdd(),
        ).pipe(finalize(() => this._commitProcessing = false)).subscribe(
            commitId => this.handleCommitSuccess(commitId),
            error => this.handleCommitFail(error),
        );
    }

    closeThisDialog(result?: VcsCommitDialogResult): void {
        this.dialogRef.close(result);
    }

    private async loadAccounts(): Promise<void> {
        const accounts = await this.accountDB.getAllAccounts();

        this.accounts = accounts;
        this.authorMenuItems = accounts.map(account => ({
            id: account.email,
            label: `${account.name} <${account.email}>`,
        } as MenuItem));
    }

    private getFilesToAdd(): string[] {
        const filesToAdd: string[] = [];
        const selectedItems = this.itemListManager.getSelectedItems();

        selectedItems.forEach((itemRef) => {
            filesToAdd.push(...itemRef._config.fileChanges.map(change => change.filePath));
        });

        return filesToAdd;
    }

    private handleCommitSuccess(commitId: string): void {
        this.store.dispatch(new CommittedAction({ commitId }));
        this.dialogRef.close({ committed: true });
    }

    private handleCommitFail(error: VcsError): void {
        // TODO(@seokju-na): Handle failure
        console.error(error);
    }
}
