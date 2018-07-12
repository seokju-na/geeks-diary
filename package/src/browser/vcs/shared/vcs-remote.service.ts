import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthenticationInfo } from '../../../models/authentication-info';
import { VcsRemoteProvider } from '../vcs-remote-providers/vcs-remote-provider';
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
    providedIn: 'root',
})
export class VcsRemoteService {
    _provider: VcsRemoteProvider;

    constructor(
        private providerFactory: VcsRemoteProviderFactory,
        private http: HttpClient,
    ) {
    }

    setProvider(type: VcsRemoteProviderTypes): void {
        this._provider = this.providerFactory.create(type);
    }

    isRepositoryUrlValid(url: string): boolean {
        this.checkIfProviderIsNotSet();
        return this._provider.isRepositoryUrlValid(url);
    }

    loginWithBasicAuthorization(
        username: string,
        password: string,
        options?: VcsRemoteLoginOptions,
    ): Observable<AuthenticationInfo> {
        this.checkIfProviderIsNotSet();

        // Store authentication info at database.

        return this._provider.authorizeByBasic(username, password);
    }

    loginWithOauth2TokenAuthorization(
        token: string,
        options?: VcsRemoteLoginOptions,
    ): Observable<AuthenticationInfo> {
        this.checkIfProviderIsNotSet();

        // Store authentication info at database.

        return this._provider.authorizeByOauth2Token(token);
    }

    private checkIfProviderIsNotSet(): void {
        if (this._provider) {
            throw new Error('No provider!');
        }
    }
}
