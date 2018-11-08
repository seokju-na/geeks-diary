import { InjectionToken } from '@angular/core';
import Dexie from 'dexie';
import { Database } from '../../core/database';
import { VcsAuthenticationInfo } from '../../core/vcs';


export class VcsAuthenticationDatabase extends Database {
    readonly authentications!: Dexie.Table<VcsAuthenticationInfo, number>;

    constructor() {
        super('VcsAuthentication');

        this.conditionalVersion(1, {
            authentications: '++, type, authorizationHeader, providerName, userName, displayName, email',
        });
    }
}


export const vcsAuthenticationDatabase = new VcsAuthenticationDatabase();

export const VCS_AUTHENTICATION_DATABASE = new InjectionToken<VcsAuthenticationDatabase>('VcsAuthenticationDatabase');

export const VcsAuthenticationDatabaseProvider = {
    provide: VCS_AUTHENTICATION_DATABASE,
    useValue: vcsAuthenticationDatabase,
};
