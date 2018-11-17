import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { UiModule } from '../ui/ui.module';
import { VcsAuthenticationDatabaseProvider } from './vcs-authentication-database';
import { VcsManagerComponent } from './vcs-manager.component';
import { VcsRemoteModule } from './vcs-remote';
import { VcsViewModule } from './vcs-view';
import { VcsEffects } from './vcs.effects';
import { vcsReducerMap } from './vcs.reducer';
import { VcsService } from './vcs.service';


@NgModule({
    imports: [
        UiModule,
        VcsRemoteModule,
        VcsViewModule,
        StoreModule.forFeature('vcs', vcsReducerMap),
        EffectsModule.forFeature([VcsEffects]),
    ],
    declarations: [
        VcsManagerComponent,
    ],
    entryComponents: [
        VcsManagerComponent,
    ],
    providers: [
        VcsAuthenticationDatabaseProvider,
        VcsService,
    ],
    exports: [
        VcsRemoteModule,
        VcsViewModule,
        VcsManagerComponent,
    ],
})
export class VcsModule {
}
