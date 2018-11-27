import { NgModule } from '@angular/core';
import { UiModule } from '../../ui/ui.module';
import { BaseVcsItemFactory } from './base-vcs-item/base-vcs-item-factory';
import { BaseVcsItemComponent } from './base-vcs-item/base-vcs-item.component';
import { VcsAccountItemComponent } from './vcs-account-item/vcs-account-item.component';
import { VcsItemListManagerFactoryProvider } from './vcs-item-list-manager';
import { VcsItemMaker } from './vcs-item-maker';
import { VcsCommitItemComponent } from './vcs-commit-item/vcs-commit-item.component';


@NgModule({
    imports: [
        UiModule,
    ],
    declarations: [
        BaseVcsItemComponent,
        VcsAccountItemComponent,
        VcsCommitItemComponent,
    ],
    entryComponents: [
        BaseVcsItemComponent,
    ],
    providers: [
        BaseVcsItemFactory,
        VcsItemMaker,
        VcsItemListManagerFactoryProvider,
    ],
    exports: [
        BaseVcsItemComponent,
        VcsAccountItemComponent,
        VcsCommitItemComponent,
    ],
})
export class VcsViewModule {
}
