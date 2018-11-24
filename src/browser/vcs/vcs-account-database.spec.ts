import { TestBed } from '@angular/core/testing';
import Dexie from 'dexie';
import { createDummies, fastTestSetup, sample } from '../../../test/helpers';
import { VcsAccountDummy } from '../../core/dummies';
import { VcsAccount } from '../../core/vcs';
import { VCS_ACCOUNT_DATABASE, VcsAccountDatabase, VcsAccountDatabaseProvider } from './vcs-account-database';


describe('browser.vcs.VcsAccountDatabase', () => {
    let accountDB: VcsAccountDatabase;

    const vcsAccountDummy = new VcsAccountDummy();

    fastTestSetup();

    beforeAll(async () => {
        await Dexie.delete('VcsAccount');

        TestBed.configureTestingModule({
            providers: [VcsAccountDatabaseProvider],
        });
    });

    beforeEach(() => {
        accountDB = TestBed.get(VCS_ACCOUNT_DATABASE);
    });

    afterEach(async () => {
        await accountDB.accounts.clear();
    });

    describe('#getAllAccounts', () => {
        it('should return all accounts.', async () => {
            const accounts = createDummies(vcsAccountDummy, 5);
            await accountDB.accounts.bulkAdd(accounts);

            // Expect to return all accounts.
            const result = await accountDB.getAllAccounts();
            expect(result).toEqual(accounts);
        });
    });

    describe('#deleteAccountByEmail', () => {
        it('should delete account which matches with given email.', async () => {
            const accounts = createDummies(vcsAccountDummy, 5);
            await accountDB.accounts.bulkAdd(accounts);

            const target = sample(accounts);
            const deleteCount = await accountDB.deleteAccountByEmail(target.email);

            expect(deleteCount).toBe(1);

            const allAccounts = await accountDB.getAllAccounts();
            expect(allAccounts.includes(target)).toBe(false);
        });
    });

    describe('#isAccountExists', () => {
        it('should return true as promise if account exists with given email.', async () => {
            // Add account.
            const account = vcsAccountDummy.create();
            await accountDB.accounts.add(account);

            const result = await accountDB.isAccountExists(account.email);
            expect(result).toBe(true);
        });

        it('should return false as promise if account not exists with given email.', async () => {
            const result = await accountDB.isAccountExists('some_email');
            expect(result).toBe(false);
        });
    });

    // describe('#setDefaultAccount', () => {
    //     let accounts: VcsAccount[];
    //
    //     beforeEach(async () => {
    //         accounts = createDummies(vcsAccountDummy, 10);
    //         await accountDB.accounts.bulkAdd(accounts);
    //     });
    //
    //     it('should add account as default as new.', async () => {
    //         const target = sample(accounts);
    //
    //         await accountDB.setAsDefaultAccount(target);
    //
    //         const defaultAccount = await accountDB.getDefaultAccount();
    //         expect(defaultAccount).toEqual(target);
    //     });
    //
    //     it('should update account as default.', async () => {
    //         const prev = sample(accounts);
    //         const next = sampleWithout(accounts, [prev]);
    //
    //         await accountDB.setAsDefaultAccount(prev);
    //         await accountDB.setAsDefaultAccount(next);
    //
    //         const defaultAccount = await accountDB.getDefaultAccount();
    //         expect(defaultAccount).toEqual(next);
    //     });
    // });
});
