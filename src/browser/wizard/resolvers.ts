import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { VcsService } from '../vcs';


@Injectable()
export class WizardVcsAuthenticationInfoExistsResolver implements Resolve<boolean> {
    constructor(private vcs: VcsService) {
    }

    resolve(): Promise<boolean> {
        return this.vcs.isAuthenticationInfoExists();
    }
}
