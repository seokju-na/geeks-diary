import { InjectionToken, Provider } from '@angular/core';
import Dexie from 'dexie';
import { Contribution } from '../../../core/contribution';
import { Database } from '../../../core/database';


interface ContributionWihKey {
    key: string;
    contribution: Contribution;
}


export class VcsCommitContributionDatabase extends Database {
    readonly contributions!: Dexie.Table<ContributionWihKey, string>;

    constructor() {
        super('VcsCommitContribution');

        this.conditionalVersion(1, {
            contributions: 'key, contribution',
        });
    }

    getKeyForMonth(month: Date): string {
        return `${month.getFullYear()}.${(month.getMonth() + 1).toString().padStart(2, '0')}`;
    }

    async getContributionForMonth(month: Date): Promise<Contribution | undefined> {
        const key = this.getKeyForMonth(month);
        const result = await this.contributions.get(key);

        if (result) {
            return result.contribution;
        } else {
            return undefined;
        }
    }

    async isContributionExistsForMonth(month: Date): Promise<boolean> {
        const key = this.getKeyForMonth(month);
        const count = await this.contributions.where({ key }).count();

        return count > 0;
    }

    async addNewContributionForMonth(month: Date, contribution: Contribution): Promise<string> {
        const key = this.getKeyForMonth(month);
        await this.contributions.put({ key, contribution });

        return key;
    }

    async updateContributionForMonth(month: Date, contribution: Contribution): Promise<number> {
        const key = this.getKeyForMonth(month);

        return await this.contributions.update(key, { contribution });
    }
}


export const vcsCommitContributionDatabase = new VcsCommitContributionDatabase();

export const VCS_COMMIT_CONTRIBUTION_DATABASE =
    new InjectionToken<VcsCommitContributionDatabase>('VcsCommitContributionDatabase');

export const VcsCommitContributionDatabaseProvider: Provider = {
    provide: VCS_COMMIT_CONTRIBUTION_DATABASE,
    useValue: vcsCommitContributionDatabase,
};
