import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { VcsRemoteService } from './vcs-remote.service';


@Injectable()
export class VcsRemoteAuthenticationInfoResolver implements Resolve<boolean> {
    constructor(private vcsRemote: VcsRemoteService) {
    }

    resolve(): Promise<boolean> {
        return this.vcsRemote.isAuthenticationInfoExists();
    }
}
