import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationInfo } from '../../../models/authentication-info';
import { VcsRemoteRepository } from '../../../models/vcs-remote';


export enum VcsRemoteProviderErrorCodes {
    AUTHENTICATE_ERROR = 'AUTHENTICATE_ERROR',
    REPOSITORY_NOT_EXISTS = 'REPOSITORY_NOT_EXISTS',
    UNKNOWN = 'UNKNOWN',
}


export interface VcsRemoteProviderError {
    code: VcsRemoteProviderErrorCodes;
    message?: string;
    friendlyMessage?: string;
}


export abstract class VcsRemoteProvider {
    protected constructor(
        public readonly name: string,
        public readonly apiUrl: string,
        protected http: HttpClient,
    ) {
    }

    abstract authorizeByBasic(username: string, password: string): Observable<AuthenticationInfo>;

    abstract authorizeByOauth2Token(token: string): Observable<AuthenticationInfo>;

    abstract isRepositoryUrlValid(url: string): boolean;

    abstract findRepository(url: string, authInfo?: AuthenticationInfo): Observable<VcsRemoteRepository>;
}
