import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { VcsRemoteModule } from './vcs-remote';


@NgModule({
    imports: [
        CommonModule,
        VcsRemoteModule,
    ],
    declarations: [],
    exports: [
        VcsRemoteModule,
    ],
})
export class VcsModule {
}
