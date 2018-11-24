import { InjectionToken } from '@angular/core';
import Dexie from 'dexie';
import { Database } from '../../core/database';
import { VcsAccount } from '../../core/vcs';


export class VcsAccountDatabase extends Database {
    readonly accounts!: Dexie.Table<VcsAccount, number>;

    constructor() {
        super('VcsAccount');

        this.conditionalVersion(1, {
            accounts: '++, name, email, authentication',
        });
    }

    /** Get all accounts. */
    async getAllAccounts(): Promise<VcsAccount[]> {
        return this.accounts.toCollection().toArray();
    }

    /**
     * Add new account.
     * @param account
     * @return Promise<number> Key of new added account.
     */
    async addNewAccount(account: VcsAccount): Promise<number> {
        return this.accounts.put(account);
    }

    /**
     * Delete account by email.
     * @param email
     * @return Promise<number> Delete count.
     */
    async deleteAccountByEmail(email: string): Promise<number> {
        return this.accounts.where({ email }).delete();
    }

    /** Check if account is exists. */
    async isAccountExists(email: string): Promise<boolean> {
        const count = await this.accounts.where({ email }).count();
        return count > 0;
    }
}


export const vcsAccountDatabase = new VcsAccountDatabase();

export const VCS_ACCOUNT_DATABASE = new InjectionToken<VcsAccountDatabase>('VcsAccountDatabase');

export const VcsAccountDatabaseProvider = {
    provide: VCS_ACCOUNT_DATABASE,
    useValue: vcsAccountDatabase,
};
