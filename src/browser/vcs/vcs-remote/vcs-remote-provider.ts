import { Observable } from 'rxjs';
import { VcsAccount, VcsAuthenticationInfo, VcsRemoteRepository } from '../../../core/vcs';


export abstract class VcsRemoteProvider {
    // noinspection JSValidateJSDoc
    protected constructor(
        /** The name of vcs remote provider */
        public readonly name: string,
        /** API url for vcs remote provider */
        public readonly apiUrl: string,
    ) {
    }

    /** Authorize vcs remote service with basic. */
    abstract authorizeByBasic(username: string, password: string): Observable<VcsAccount>;

    /** Authorize vcs remote service with oauth2 token. */
    abstract authorizeByOauth2Token(token: string): Observable<VcsAccount>;

    /** Check is url of repository is valid. */
    abstract isRepositoryUrlValid(url: string): boolean;

    /** Find repository at url with authentication info if its provided. */
    abstract findRepository(url: string, authInfo?: VcsAuthenticationInfo): Observable<VcsRemoteRepository>;
}
