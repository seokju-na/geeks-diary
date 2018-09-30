import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Factory } from '../../../core/common-interfaces';
import { VcsRemoteGithubProvider } from './vcs-remote-github-provider';
import { VcsRemoteProvider } from './vcs-remote-provider';


export type VcsRemoteProviderType = 'github';


@Injectable()
export class VcsRemoteProviderFactory implements Factory<VcsRemoteProvider> {
    constructor(private http: HttpClient) {
    }

    create(type: VcsRemoteProviderType): VcsRemoteProvider {
        switch (type) {
            case 'github':
                return new VcsRemoteGithubProvider(this.http);
            default:
                throw new Error('Unknown vcs remote provider.');
        }
    }
}
