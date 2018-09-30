import { Inject, Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { mapTo, switchMap } from 'rxjs/operators';
import { VcsAuthenticationInfo } from '../../../core/vcs';
import { AUTHENTICATION_DATABASE, AuthenticationDatabase } from '../../shared';
import { VcsRemoteProvider } from './vcs-remote-provider';
import { VcsRemoteProviderFactory, VcsRemoteProviderType } from './vcs-remote-provider-factory';


export class VcsRemoteLoginOptions {
    /**
     * Instance login option
     * If it is 'true' authentication info will not stores int database.
     * Defaults to be 'false'.
     */
    instanceLogin?: boolean = false;
}


@Injectable()
export class VcsRemoteService {
    _provider: VcsRemoteProvider | null = null;

    constructor(
        private providerFactory: VcsRemoteProviderFactory,
        @Inject(AUTHENTICATION_DATABASE) private authDB: AuthenticationDatabase,
    ) {
    }

    setProvider(type: VcsRemoteProviderType): this {
        this._provider = this.providerFactory.create(type);
        return this;
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
    ): Observable<VcsAuthenticationInfo> {
        this.checkIfProviderIsNotSet();

        const opts = {
            ...(new VcsRemoteLoginOptions()),
            ...options,
        };

        return this._provider.authorizeByBasic(username, password).pipe(
            switchMap(authInfo => opts.instanceLogin
                ? of(authInfo)
                : this.storeInAuthInfoDB(authInfo),
            ),
        );
    }

    loginWithOauth2TokenAuthorization(
        token: string,
        options?: VcsRemoteLoginOptions,
    ): Observable<VcsAuthenticationInfo> {
        this.checkIfProviderIsNotSet();

        const opts = {
            ...(new VcsRemoteLoginOptions()),
            ...options,
        };

        return this._provider.authorizeByOauth2Token(token).pipe(
            switchMap(authInfo => opts.instanceLogin
                ? of(authInfo)
                : this.storeInAuthInfoDB(authInfo),
            ),
        );
    }

    private checkIfProviderIsNotSet(): void {
        if (!this._provider) {
            throw new Error('No vcs remote provider!');
        }
    }

    private storeInAuthInfoDB(authInfo: VcsAuthenticationInfo): Observable<VcsAuthenticationInfo> {
        return from(this.authDB.authentications.add(authInfo)).pipe(mapTo(authInfo));
    }
}
