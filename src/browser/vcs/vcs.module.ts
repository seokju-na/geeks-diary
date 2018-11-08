import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { VcsAuthenticationDatabaseProvider } from './vcs-authentication-database';
import { VcsRemoteModule } from './vcs-remote';
import { VcsViewModule } from './vcs-view';
import { vcsReducerMap } from './vcs.reducer';
import { VcsService } from './vcs.service';


@NgModule({
    imports: [
        VcsRemoteModule,
        VcsViewModule,
        StoreModule.forFeature('vcs', vcsReducerMap),
    ],
    providers: [
        VcsAuthenticationDatabaseProvider,
        VcsService,
    ],
    exports: [
        VcsRemoteModule,
        VcsViewModule,
    ],
})
export class VcsModule {
}
