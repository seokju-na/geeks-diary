import { Inject, Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { mapTo, switchMap } from 'rxjs/operators';
import { VcsAuthenticationInfo, VcsFileChange } from '../../core/vcs';
import { GitService, WorkspaceService } from '../shared';
import { VCS_AUTHENTICATION_DATABASE, VcsAuthenticationDatabase } from './vcs-authentication-database';
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

    constructor(
        private remoteProviderFactory: VcsRemoteProviderFactory,
        private git: GitService,
        @Inject(VCS_AUTHENTICATION_DATABASE) private authDB: VcsAuthenticationDatabase,
        private workspace: WorkspaceService,
    ) {
    }

    setRemoveProvider(type: VcsRemoteProviderType): this {
        this._removeProvider = this.remoteProviderFactory.create(type);
        return this;
    }

    async isAuthenticationInfoExists(): Promise<boolean> {
        try {
            const count = await this.authDB.authentications.count();
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
    ): Observable<VcsAuthenticationInfo> {
        this.checkIfRemoteProviderIsProvided();

        const opt = {
            ...new VcsRemoteLoginOption(),
            ...option,
        } as VcsRemoteLoginOption;

        if (opt.instanceLogin) {
            return this._removeProvider.authorizeByBasic(username, password);
        } else {
            return this._removeProvider.authorizeByBasic(username, password).pipe(
                switchMap(authInfo => this.storeAuthInfo(authInfo).pipe(mapTo(authInfo))),
            );
        }
    }

    loginRemoteWithOauth2TokenAuthorization(
        token: string,
        option?: VcsRemoteLoginOption,
    ): Observable<VcsAuthenticationInfo> {
        this.checkIfRemoteProviderIsProvided();

        const opt = {
            ...new VcsRemoteLoginOption(),
            ...option,
        } as VcsRemoteLoginOption;

        if (opt.instanceLogin) {
            return this._removeProvider.authorizeByOauth2Token(token);
        } else {
            return this._removeProvider.authorizeByOauth2Token(token).pipe(
                switchMap(authInfo => this.storeAuthInfo(authInfo).pipe(mapTo(authInfo))),
            );
        }
    }

    fetchFileChanges(): Observable<VcsFileChange[]> {
        return this.git.getFileChanges(this.workspace.configs.rootDirPath);
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
            return from(this.authDB.authentications.toCollection().last()).pipe(
                switchMap(authInfo => this.git.cloneRepository(sourceUrl, distLocalPath, authInfo)),
            );
        } else {
            return this.git.cloneRepository(sourceUrl, distLocalPath);
        }
    }

    private checkIfRemoteProviderIsProvided(): void {
        if (!this._removeProvider) {
            throw new Error('No vcs remote provider!');
        }
    }

    private storeAuthInfo(authInfo: VcsAuthenticationInfo): Observable<number> {
        return from(this.authDB.authentications.add(authInfo));
    }
}
