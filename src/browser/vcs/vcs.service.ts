import { Inject, Injectable } from '@angular/core';
import { from, Observable, of, zip } from 'rxjs';
import { filter, map, mapTo, switchMap, tap } from 'rxjs/operators';
import { GitGetHistoryOptions, GitSyncWithRemoteResult } from '../../core/git';
import { VcsAccount, VcsCommitItem, VcsFileChange } from '../../core/vcs';
import { toPromise } from '../../libs/rx';
import { GitService, WorkspaceService } from '../shared';
import { VCS_ACCOUNT_DATABASE, VcsAccountDatabase } from './vcs-account-database';
import { VcsRemoteProvider, VcsRemoteProviderFactory, VcsRemoteProviderType } from './vcs-remote';


export class VcsRemoteLoginOption {
    /** If its set, authentication info will not stores in database. */
    instanceLogin?: boolean = false;
}


export class VcsCloneRepositoryOption {
    useAuthenticationInfoInStoreIfExists?: boolean = true;
}


@Injectable()
export class VcsService {
    _removeProvider: VcsRemoteProvider | null = null;

    private nextCommitHistoryFetchingOptions: GitGetHistoryOptions | null = null;

    constructor(
        private remoteProviderFactory: VcsRemoteProviderFactory,
        private git: GitService,
        @Inject(VCS_ACCOUNT_DATABASE) private accountDB: VcsAccountDatabase,
        private workspace: WorkspaceService,
    ) {
    }

    // Git commit history.
    private _commitHistoryFetchingSize: number = 50;

    get commitHistoryFetchingSize(): number {
        return this._commitHistoryFetchingSize;
    }

    setRemoveProvider(type: VcsRemoteProviderType): this {
        this._removeProvider = this.remoteProviderFactory.create(type);
        return this;
    }

    setCommitHistoryFetchingSize(size: number): this {
        this._commitHistoryFetchingSize = size;
        return this;
    }

    async isAuthenticationInfoExists(): Promise<boolean> {
        try {
            const count = await this.accountDB.accounts.count();
            return count > 0;
        } catch (error) {
            return false;
        }
    }

    isRemoteRepositoryUrlValid(url: string): boolean {
        this.checkIfRemoteProviderIsProvided();
        return this._removeProvider.isRepositoryUrlValid(url);
    }

    loginRemoteWithBasicAuthorization(
        username: string,
        password: string,
        option?: VcsRemoteLoginOption,
    ): Observable<VcsAccount> {
        this.checkIfRemoteProviderIsProvided();

        const opt = {
            ...new VcsRemoteLoginOption(),
            ...option,
        } as VcsRemoteLoginOption;

        if (opt.instanceLogin) {
            return this._removeProvider.authorizeByBasic(username, password);
        } else {
            return this._removeProvider.authorizeByBasic(username, password).pipe(
                switchMap(account => this.storeAccountInfo(account).pipe(mapTo(account))),
            );
        }
    }

    loginRemoteWithOauth2TokenAuthorization(
        token: string,
        option?: VcsRemoteLoginOption,
    ): Observable<VcsAccount> {
        this.checkIfRemoteProviderIsProvided();

        const opt = {
            ...new VcsRemoteLoginOption(),
            ...option,
        } as VcsRemoteLoginOption;

        if (opt.instanceLogin) {
            return this._removeProvider.authorizeByOauth2Token(token);
        } else {
            return this._removeProvider.authorizeByOauth2Token(token).pipe(
                switchMap(account => this.storeAccountInfo(account).pipe(mapTo(account))),
            );
        }
    }

    fetchFileChanges(): Observable<VcsFileChange[]> {
        return this.git.getFileChanges(this.workspace.configs.rootDirPath);
    }

    fetchCommitHistory(): Observable<VcsCommitItem[]> {
        this.nextCommitHistoryFetchingOptions = null;

        return this.git.getCommitHistory({
            workspaceDirPath: this.workspace.configs.rootDirPath,
            size: this._commitHistoryFetchingSize,
        }).pipe(
            tap(result => this.nextCommitHistoryFetchingOptions = result.next),
            map(result => result.history),
        );
    }

    fetchMoreCommitHistory(): Observable<VcsCommitItem[]> {
        // Return empty list, if all history are loaded.
        if (!this.nextCommitHistoryFetchingOptions) {
            return of([]);
        }

        return this.git.getCommitHistory(this.nextCommitHistoryFetchingOptions).pipe(
            tap(result => this.nextCommitHistoryFetchingOptions = result.next),
            map(result => result.history),
        );
    }

    cloneRepository(
        sourceUrl: string,
        distLocalPath: string,
        option?: VcsCloneRepositoryOption,
    ): Observable<void> {
        const opt = {
            ...new VcsCloneRepositoryOption(),
            ...option,
        } as VcsCloneRepositoryOption;

        if (opt.useAuthenticationInfoInStoreIfExists) {
            return from(this.accountDB.accounts.toCollection().last()).pipe(
                switchMap(account => this.git.cloneRepository(
                    sourceUrl,
                    distLocalPath,
                    account ? account.authentication : undefined,
                )),
            );
        } else {
            return this.git.cloneRepository(sourceUrl, distLocalPath);
        }
    }

    async canSyncRepository(): Promise<boolean> {
        const fetchAccount = await this.accountDB.getRepositoryFetchAccount();
        const isRemoteExists = await toPromise(this.git.isRemoteExists({
            workspaceDirPath: this.workspace.configs.rootDirPath,
            remoteName: 'origin',
        }));

        return (fetchAccount !== undefined) && isRemoteExists;
    }

    setRemoteRepository(fetchAccount: VcsAccount, remoteUrl: string): Observable<void> {
        return zip(
            from(this.accountDB.setRepositoryFetchAccountAs(fetchAccount)),
            this.git.setRemote({
                workspaceDirPath: this.workspace.configs.rootDirPath,
                remoteName: 'origin',
                remoteUrl,
            }),
        ).pipe(mapTo(null));
    }

    syncRepository(): Observable<GitSyncWithRemoteResult> {
        return from(this.accountDB.getRepositoryFetchAccount()).pipe(
            filter(fetchAccount => fetchAccount !== undefined),
            switchMap(fetchAccount => this.git.syncWithRemote({
                workspaceDirPath: this.workspace.configs.rootDirPath,
                remoteName: 'origin',
                authentication: fetchAccount.authentication,
                author: fetchAccount,
            })),
        );
    }

    private checkIfRemoteProviderIsProvided(): void {
        if (!this._removeProvider) {
            throw new Error('No vcs remote provider!');
        }
    }

    private storeAccountInfo(authInfo: VcsAccount): Observable<number> {
        return from(this.accountDB.accounts.add(authInfo));
    }
}
