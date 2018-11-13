import { NgModule } from '@angular/core';
import { UiModule } from '../../ui/ui.module';
import { BaseVcsItemFactory } from './base-vcs-item/base-vcs-item-factory';
import { BaseVcsItemComponent } from './base-vcs-item/base-vcs-item.component';
import { VcsItemListManager } from './vcs-item-list-manager';
import { VcsItemMaker } from './vcs-item-maker';
import { VcsManagerComponent } from './vcs-manager/vcs-manager.component';


@NgModule({
    imports: [
        UiModule,
    ],
    declarations: [
        VcsManagerComponent,
        BaseVcsItemComponent,
    ],
    entryComponents: [
        VcsManagerComponent,
        BaseVcsItemComponent,
    ],
    providers: [
        BaseVcsItemFactory,
        VcsItemMaker,
        VcsItemListManager,
    ],
    exports: [
        VcsManagerComponent,
        BaseVcsItemComponent,
    ],
})
export class VcsViewModule {
}
