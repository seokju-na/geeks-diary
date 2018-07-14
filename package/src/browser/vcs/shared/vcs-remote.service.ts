import { Inject, Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { mapTo, switchMap } from 'rxjs/operators';
import { AuthenticationInfo } from '../../../models/authentication-info';
import { AUTHENTICATION_DATABASE, AuthenticationDatabase } from '../../core/authentication-database';
import { GitService } from '../../core/git.service';
import { VcsRemoteProvider } from '../vcs-remote-providers/vcs-remote-provider';
import { VcsModule } from '../vcs.module';
import { VcsRemoteProviderFactory, VcsRemoteProviderTypes } from './vcs-remote-provider-factory';


export class VcsRemoteLoginOptions {
    /**
     * Instance login option
     * If it is 'true' authentication info will not stores int database.
     * Defaults to be 'false'.
     */
    instanceLogin?: boolean = false;
}


@Injectable({
    providedIn: VcsModule,
})
export class VcsRemoteService {
    _provider: VcsRemoteProvider | null = null;

    constructor(
        private providerFactory: VcsRemoteProviderFactory,
        private git: GitService,
        @Inject(AUTHENTICATION_DATABASE) private authDB: AuthenticationDatabase,
    ) {
    }

    setProvider(type: VcsRemoteProviderTypes): void {
        this._provider = this.providerFactory.create(type);
    }

    isRepositoryUrlValid(url: string): boolean {
        this.checkIfProviderIsNotSet();
        return this._provider.isRepositoryUrlValid(url);
    }

    async isAuthenticationInfoExists(): Promise<boolean> {
        try {
            const count = await this.authDB.authentications.count();

            return count > 0;
        } catch (error) {
            return false;
        }
    }

    loginWithBasicAuthorization(
        username: string,
        password: string,
        options?: VcsRemoteLoginOptions,
    ): Observable<AuthenticationInfo> {
        this.checkIfProviderIsNotSet();

        const opts = {
            ...(new VcsRemoteLoginOptions()),
            ...options,
        };

        // Store authentication info at database.
        const storeAuthInfoInDB = (authInfo: AuthenticationInfo) =>
            from(this.authDB.authentications.add(authInfo)).pipe(mapTo(authInfo));

        return this._provider.authorizeByBasic(username, password).pipe(
            switchMap(authInfo => opts.instanceLogin
                ? of(authInfo)
                : storeAuthInfoInDB(authInfo),
            ),
        );
    }

    loginWithOauth2TokenAuthorization(
        token: string,
        options?: VcsRemoteLoginOptions,
    ): Observable<AuthenticationInfo> {
        this.checkIfProviderIsNotSet();

        const opts = {
            ...(new VcsRemoteLoginOptions()),
            ...options,
        };

        // Store authentication info at database.
        const storeAuthInfoInDB = (authInfo: AuthenticationInfo) =>
            from(this.authDB.authentications.add(authInfo)).pipe(mapTo(authInfo));

        return this._provider.authorizeByOauth2Token(token).pipe(
            switchMap(authInfo => opts.instanceLogin
                ? of(authInfo)
                : storeAuthInfoInDB(authInfo),
            ),
        );
    }

    cloneRepository(url: string, localPath: string): Observable<void> {
        const getLastAuth = async (): Promise<AuthenticationInfo | null> => {
            if (await this.isAuthenticationInfoExists()) {
                return this.authDB.authentications.toCollection().last();
            }

            return null;
        };

        return from(getLastAuth()).pipe(
            switchMap(authInfo => this.git.cloneRepository(
                url,
                localPath,
                authInfo,
            )),
        );
    }

    private checkIfProviderIsNotSet(): void {
        if (!this._provider) {
            throw new Error('No provider!');
        }
    }
}
