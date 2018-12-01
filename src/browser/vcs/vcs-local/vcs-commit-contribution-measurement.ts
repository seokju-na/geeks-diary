import { Inject, Injectable } from '@angular/core';
import { Contribution, ContributionMeasurement } from '../../../core/contribution';
import { datetime } from '../../../libs/datetime';
import { toPromise } from '../../../libs/rx';
import { GitService, WorkspaceService } from '../../shared';
import { VCS_COMMIT_CONTRIBUTION_DATABASE, VcsCommitContributionDatabase } from './vcs-commit-contribution-database';


@Injectable()
export class VcsCommitContributionMeasurement extends ContributionMeasurement<Date> {
    constructor(
        private workspace: WorkspaceService,
        private git: GitService,
        @Inject(VCS_COMMIT_CONTRIBUTION_DATABASE)
        private contributionDB: VcsCommitContributionDatabase,
    ) {
        super();
    }

    async measure(keys: Date[], keyGenerator: (key: Date) => string): Promise<Contribution> {
        // Ensure all keys are same month.
        const month = datetime.copy(keys[0]);

        if (!datetime.isValid(month)) {
            throw new Error('VcsCommitContributionMeasurement: Invalid keys');
        }

        const now = datetime.today();
        const isCurrentMonth = now.getFullYear() === month.getFullYear() && now.getMonth() === month.getMonth();
        const isCacheExists = await this.contributionDB.isContributionExistsForMonth(month);

        // If cache exists, return the cache.
        if (!isCurrentMonth && isCacheExists) {
            return await this.contributionDB.getContributionForMonth(month);
        }

        const since = datetime.getFirstDateOfMonth(month.getFullYear(), month.getMonth()).getTime();
        const until = datetime.getLastDateOfMonth(month.getFullYear(), month.getMonth()).getTime();

        // Get commits in date range.
        const { history } = await toPromise(this.git.getCommitHistory({
            workspaceDirPath: this.workspace.configs.rootDirPath,
            dateRange: { since, until },
        }));

        // Make contribution.
        const contribution: Contribution = { items: {} };

        for (let i = 0; i < keys.length; i++) {
            const itemName = keyGenerator(keys[i]);

            // Count commits for date.
            contribution.items[itemName] = history
                .filter(commit => datetime.isSameDay(new Date(commit.timestamp), keys[i]))
                .length;
        }

        // If date is current month, do not save cache.
        if (!isCurrentMonth) {
            if (isCacheExists) {
                await this.contributionDB.updateContributionForMonth(month, contribution);
            } else {
                await this.contributionDB.addNewContributionForMonth(month, contribution);
            }
        }

        return contribution;
    }
}
