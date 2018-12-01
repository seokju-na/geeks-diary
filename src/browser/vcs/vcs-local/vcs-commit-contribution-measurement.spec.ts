import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { createDummies, fastTestSetup } from '../../../../test/helpers';
import { Contribution } from '../../../core/contribution';
import { VcsCommitItemDummy } from '../../../core/dummies';
import { GitGetHistoryResult } from '../../../core/git';
import { datetime, DateUnits } from '../../../libs/datetime';
import { GitService, SharedModule } from '../../shared';
import {
    VCS_COMMIT_CONTRIBUTION_DATABASE,
    VcsCommitContributionDatabase,
    VcsCommitContributionDatabaseProvider,
} from './vcs-commit-contribution-database';
import { VcsCommitContributionMeasurement } from './vcs-commit-contribution-measurement';


describe('browser.vcs.vcsLocal.VcsCommitContributionMeasurement', () => {
    let measurement: VcsCommitContributionMeasurement;

    let git: GitService;
    let contributionDB: VcsCommitContributionDatabase;

    const commitItemDummy = new VcsCommitItemDummy();
    const keyGenerator = (date: Date) => `${date.getFullYear()}.${date.getMonth()}.${date.getDate()}`;

    function createKeysForMonth(monthDate: Date): Date[] {
        const keys: Date[] = [];

        const year = monthDate.getFullYear();
        const month = monthDate.getMonth();

        const indexDate = datetime.getFirstDateOfMonth(year, month);

        for (let i = 0; i < datetime.getDaysInMonth(year, month); i++) {
            keys.push(datetime.copy(indexDate));
            datetime.add(indexDate, DateUnits.DAY, 1);
        }

        return keys;
    }

    fastTestSetup();

    beforeAll(() => {
        TestBed.configureTestingModule({
            imports: [
                SharedModule,
            ],
            providers: [
                VcsCommitContributionDatabaseProvider,
                VcsCommitContributionMeasurement,
            ],
        });
    });

    beforeEach(() => {
        measurement = TestBed.get(VcsCommitContributionMeasurement);
        git = TestBed.get(GitService);
        contributionDB = TestBed.get(VCS_COMMIT_CONTRIBUTION_DATABASE);
    });

    afterEach(async () => {
        await contributionDB.contributions.clear();
    });

    describe('measure', () => {
        it('should throw error if first key is not a valid date.', async () => {
            let error = null;

            try {
                await measurement.measure([undefined], keyGenerator);
            } catch (err) {
                error = err;
            }

            expect(error).not.toBeNull();
        });

        it('should contribution exists in database at input month which is not current month, '
            + 'return cache from database.', async () => {
            const contribution: Contribution = { items: {} };

            spyOn(contributionDB, 'isContributionExistsForMonth').and.returnValue(Promise.resolve(true));
            spyOn(contributionDB, 'getContributionForMonth').and.returnValue(contribution);

            const prevMonth = datetime.today();
            datetime.add(prevMonth, DateUnits.MONTH, -1);

            const result = await measurement.measure([prevMonth], keyGenerator);
            expect(result).toEqual(contribution);
        });

        it('should get commits since first date of month until end date of month, and makes '
            + 'contribution.', async () => {
            const today = datetime.today();

            const commits = createDummies(commitItemDummy, 10);
            const keys = createKeysForMonth(today);

            spyOn(contributionDB, 'isContributionExistsForMonth').and.returnValue(Promise.resolve(false));
            spyOn(git, 'getCommitHistory').and.returnValue(of({
                history: commits,
                next: null,
                previous: null,
            } as GitGetHistoryResult));

            const result = await measurement.measure(keys, keyGenerator);

            expect(result.items[keyGenerator(today)]).toEqual(10);
        });
    });
});
