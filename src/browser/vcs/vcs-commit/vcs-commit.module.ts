import { NgModule } from '@angular/core';
import { UiModule } from '../../ui/ui.module';
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
    exports: [
        VcsCommitDialogComponent,
    ],
})
export class VcsCommitModule {
}
