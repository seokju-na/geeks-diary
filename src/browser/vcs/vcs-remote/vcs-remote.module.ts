import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared';
import { VcsRemoteAuthenticationInfoResolver } from './vcs-remote-authentication-info.resolver';
import { VcsRemoteProviderFactory } from './vcs-remote-provider-factory';
import { VcsRemoteService } from './vcs-remote.service';


@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        SharedModule,
    ],
    providers: [
        VcsRemoteProviderFactory,
        VcsRemoteService,
        VcsRemoteAuthenticationInfoResolver,
    ],
    declarations: [],
    exports: [],
})
export class VcsRemoteModule {
}
