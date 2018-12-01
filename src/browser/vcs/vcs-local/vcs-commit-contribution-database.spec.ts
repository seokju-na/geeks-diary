import { TestBed } from '@angular/core/testing';
import Dexie from 'dexie';
import { fastTestSetup } from '../../../../test/helpers';
import { Contribution } from '../../../core/contribution';
import {
    VCS_COMMIT_CONTRIBUTION_DATABASE,
    VcsCommitContributionDatabase,
    VcsCommitContributionDatabaseProvider,
} from './vcs-commit-contribution-database';


describe('browser.vcs.vcsLocal.VcsCommitContributionDatabase', () => {
    let contributionDB: VcsCommitContributionDatabase;

    fastTestSetup();

    beforeAll(async () => {
        await Dexie.delete('VcsCommitContribution');

        TestBed.configureTestingModule({
            providers: [VcsCommitContributionDatabaseProvider],
        });
    });

    beforeEach(() => {
        contributionDB = TestBed.get(VCS_COMMIT_CONTRIBUTION_DATABASE);
    });

    afterEach(async () => {
        await contributionDB.contributions.clear();
    });

    describe('getKeyForMonth', () => {
        it('should return \'yyyy.MM\' format string.', () => {
            let month = new Date(2018, 11);
            expect(contributionDB.getKeyForMonth(month)).toEqual('2018.12');

            month = new Date(2018, 3);
            expect(contributionDB.getKeyForMonth(month)).toEqual('2018.04');
        });
    });

    describe('getContributionForMonth', () => {
        it('should return contribution if there is a data for the month.', async () => {
            const contribution = { items: { '2018.05.01': 10 } };
            await contributionDB.contributions.put({
                key: '2018.05',
                contribution,
            });

            const month = new Date(2018, 4);
            const result = await contributionDB.getContributionForMonth(month);

            expect(result).toEqual(contribution);
        });

        it('should return undefined if there is no data for the month.', async () => {
            const month = new Date(2222, 5);
            const result = await contributionDB.getContributionForMonth(month);

            expect(result).toEqual(undefined);
        });
    });

    describe('isContributionExistsForMonth', () => {
        it('should return \'true\' if there is a data for the month.', async () => {
            await contributionDB.contributions.put({
                key: '2018.12',
                contribution: { items: {} },
            });

            const month = new Date(2018, 11);
            const result = await contributionDB.isContributionExistsForMonth(month);

            expect(result).toBe(true);
        });

        it('should return \'false\' if there is no data for the month.', async () => {
            const month = new Date(2222, 11);
            const result = await contributionDB.isContributionExistsForMonth(month);

            expect(result).toBe(false);
        });
    });

    describe('addNewContributionForMonth', () => {
        it('should put new data for month.', async () => {
            const key = await contributionDB.addNewContributionForMonth(
                new Date(2018, 4),
                { items: {} },
            );

            expect(key).toEqual('2018.05');
        });
    });

    describe('updateContributionForMonth', () => {
        it('should update exists data for month.', async () => {
            await contributionDB.contributions.put({
                key: '2018.08',
                contribution: { items: {} },
            });

            const month = new Date(2018, 7);
            const contribution = { items: { '2018.03.31': 10 } } as Contribution;

            await contributionDB.updateContributionForMonth(month, contribution);

            // Get new data.
            const updatedData = await contributionDB.contributions.get('2018.08');
            expect(updatedData.contribution).toEqual(contribution);
        });
    });
});
