import { NgModule } from '@angular/core';
import { UiModule } from '../../ui/ui.module';
import { VcsCommitContributionDatabaseProvider } from './vcs-commit-contribution-database';
import { VcsCommitContributionMeasurement } from './vcs-commit-contribution-measurement';
import { VcsCommitDialogComponent } from './vcs-commit-dialog/vcs-commit-dialog.component';


@NgModule({
    imports: [
        UiModule,
    ],
    declarations: [
        VcsCommitDialogComponent,
    ],
    entryComponents: [
        VcsCommitDialogComponent,
    ],
    providers: [
        VcsCommitContributionDatabaseProvider,
        VcsCommitContributionMeasurement,
    ],
    exports: [
        VcsCommitDialogComponent,
    ],
})
export class VcsLocalModule {
}
