import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared';
import { VcsRemoteProviderFactory } from './vcs-remote-provider-factory';


@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        SharedModule,
    ],
    providers: [
        VcsRemoteProviderFactory,
    ],
    declarations: [],
})
export class VcsRemoteModule {
}
