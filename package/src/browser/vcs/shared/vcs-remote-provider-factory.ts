import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Factory } from '../../../models/common-interfaces';
import { VcsRemoteGithubProvider } from '../vcs-remote-providers/vcs-remote-github-provider';
import { VcsRemoteProvider } from '../vcs-remote-providers/vcs-remote-provider';


export type VcsRemoteProviderTypes = 'github';


@Injectable({
    providedIn: 'root',
})
export class VcsRemoteProviderFactory implements Factory<VcsRemoteProvider> {
    constructor(private http: HttpClient) {
    }

    create(type: VcsRemoteProviderTypes): VcsRemoteProvider {
        switch (type) {
            case 'github':
                return new VcsRemoteGithubProvider(this.http);

            default:
                throw new Error('Unknown vcs remote provider.');
        }
    }
}
