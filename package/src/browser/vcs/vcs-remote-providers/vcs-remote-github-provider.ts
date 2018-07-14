import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { makeBasicAuthorizationHeader, makeOauth2TokenAuthorizationHeader } from '../../../libs/authentication';
import { parseRemoteUrl } from '../../../libs/parse-remote-url';
import { AuthenticationInfo, AuthenticationTypes } from '../../../models/authentication-info';
import { VcsRemoteRepository } from '../../../models/vcs-remote';
import { VcsRemoteProvider, VcsRemoteProviderError, VcsRemoteProviderErrorCodes } from './vcs-remote-provider';


interface GithubUserResponse {
    avatar_url?: string;
    html_url: string;
    name: string;
    email: string;
}


interface GithubRepositoryResponse {
    name: string;
    html_url: string;
    url: string;
    git_url: string;
    ssh_url: string;
}


export const API_URL = 'https://api.github.com';
export const AUTH_API_URL = `${API_URL}/user`;
export const REPO_API_URL = (owner, repo) => `${API_URL}/repos/${owner}/${repo}`;


export class VcsRemoteGithubProvider extends VcsRemoteProvider {
    constructor(private http: HttpClient) {
        super('github', API_URL);
    }

    authorizeByBasic(username: string, password: string): Observable<AuthenticationInfo> {
        const authorizationHeader = makeBasicAuthorizationHeader(username, password);
        const headers = { Authorization: authorizationHeader };

        return this.http
            .get<GithubUserResponse>(AUTH_API_URL, {
                headers: this.getHeadersWithDefaults(headers),
            })
            .pipe(
                map(() => ({
                    type: AuthenticationTypes.BASIC,
                    authorizationHeader,
                    providerName: this.name,
                    username,
                    password,
                } as AuthenticationInfo)),
                catchError(error => throwError(this.parseAuthorizeError(error))),
            );
    }

    authorizeByOauth2Token(token: string): Observable<AuthenticationInfo> {
        const authorizationHeader = makeOauth2TokenAuthorizationHeader(token);
        const headers = { Authorization: authorizationHeader };

        return this.http
            .get<GithubUserResponse>(AUTH_API_URL, {
                headers: this.getHeadersWithDefaults(headers),
            })
            .pipe(
                map(() => ({
                    type: AuthenticationTypes.OAUTH2_TOKEN,
                    authorizationHeader,
                    providerName: this.name,
                    token,
                } as AuthenticationInfo)),
                catchError(error => throwError(this.parseAuthorizeError(error))),
            );
    }

    isRepositoryUrlValid(url: string): boolean {
        const result = parseRemoteUrl(url);

        if (!result) {
            return false;
        }

        return result.hostname === 'github.com'
            && result.owner !== ''
            && result.name !== '';
    }

    findRepository(url: string, authInfo?: AuthenticationInfo): Observable<VcsRemoteRepository> {
        if (!this.isRepositoryUrlValid(url)) {
            throw new Error('Invalid repository url.');
        }

        const [owner, repo] = this.parseRepositoryUrl(url);
        const repoUrl = REPO_API_URL(owner, repo);

        const headers = authInfo
            ? this.getHeadersWithAuthorization(authInfo)
            : this.getHeadersWithDefaults();

        return this.http
            .get<GithubRepositoryResponse>(repoUrl, { headers })
            .pipe(
                map(response => this.parseRepositoryResponse(response)),
                catchError(error => throwError(this.parseFindRepositoryError(error))),
            );
    }

    private parseRepositoryResponse(response: GithubRepositoryResponse): VcsRemoteRepository {
        return {
            url: response.html_url,
            apiUrl: response.url,
            name: response.name,
            gitUrl: response.git_url,
            sshUrl: response.ssh_url,
        };
    }

    private parseAuthorizeError(error: HttpErrorResponse): VcsRemoteProviderError {
        if (error.status === 401) {
            return { code: VcsRemoteProviderErrorCodes.AUTHENTICATE_ERROR };
        }

        return { code: VcsRemoteProviderErrorCodes.UNKNOWN };
    }

    private parseFindRepositoryError(error: HttpErrorResponse): VcsRemoteProviderError {
        if (error.status === 404) {
            return {
                code: VcsRemoteProviderErrorCodes.REPOSITORY_NOT_EXISTS,
                message: error.message,
            };
        }

        return { code: VcsRemoteProviderErrorCodes.UNKNOWN };
    }

    /**
     * Parse repository raw url to get 'owner' and 'repo' value.
     * First element of return array is 'owner' and second is 'repo'.
     * @param {string} url
     * @returns {[string, string]}
     */
    private parseRepositoryUrl(url: string): [string, string] {
        const result = parseRemoteUrl(url);

        if (!result) {
            return [null, null];
        }

        return [result.owner, result.name];
    }

    private getHeadersWithAuthorization(
        authInfo: AuthenticationInfo,
    ): { [header: string]: string | string[] } {

        return this.getHeadersWithDefaults({
            Authorization: authInfo.authorizationHeader,
        });
    }

    private getHeadersWithDefaults(
        headers: {[key: string]: string} = {},
    ): { [header: string]: string | string[] } {

        const defaults = {
            Accept: 'application/vnd.github.v3+json',
        };

        return { ...defaults, ...headers };
    }
}
