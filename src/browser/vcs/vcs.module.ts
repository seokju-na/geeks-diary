import { NgModule } from '@angular/core';
import { VcsAuthenticationDatabaseProvider } from './vcs-authentication-database';
import { VcsRemoteModule } from './vcs-remote';
import { VcsService } from './vcs.service';


@NgModule({
    imports: [
        VcsRemoteModule,
    ],
    providers: [
        VcsAuthenticationDatabaseProvider,
        VcsService,
    ],
    exports: [
        VcsRemoteModule,
    ],
})
export class VcsModule {
}
