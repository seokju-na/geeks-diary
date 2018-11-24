import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared';
import { UiModule } from '../../ui/ui.module';
import { VcsViewModule } from '../vcs-view';
import { GithubAccountsDialogComponent } from './github-accounts-dialog/github-accounts-dialog.component';
import { VcsRemoteProviderFactory } from './vcs-remote-provider-factory';


@NgModule({
    imports: [
        UiModule,
        HttpClientModule,
        SharedModule,
        VcsViewModule,
    ],
    declarations: [
        GithubAccountsDialogComponent,
    ],
    entryComponents: [
        GithubAccountsDialogComponent,
    ],
    providers: [
        VcsRemoteProviderFactory,
    ],
    exports: [
        GithubAccountsDialogComponent,
    ],
})
export class VcsRemoteModule {
}
