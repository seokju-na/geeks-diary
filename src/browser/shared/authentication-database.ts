import { InjectionToken } from '@angular/core';
import Dexie from 'dexie';
import { Database } from '../../core/database';
import { VcsAuthenticationInfo } from '../../core/vcs';


export class AuthenticationDatabase extends Database {
    readonly authentications!: Dexie.Table<VcsAuthenticationInfo, number>;

    constructor() {
        super('Authentication');

        this.conditionalVersion(1, {
            authentications: '++, type, authorizationHeader, providerName, userName, displayName, email',
        });
    }
}


export const authenticationDatabase = new AuthenticationDatabase();

export const AUTHENTICATION_DATABASE = new InjectionToken<AuthenticationDatabase>(
    'AuthenticationDatabase',
);

export const AuthenticationDatabaseProvider = {
    provide: AUTHENTICATION_DATABASE,
    useValue: authenticationDatabase,
};
