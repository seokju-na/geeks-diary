import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { UiModule } from '../ui/ui.module';
import { VcsAccountDatabaseProvider } from './vcs-account-database';
import { VcsLocalModule } from './vcs-local';
import { VcsManagerComponent } from './vcs-manager.component';
import { VcsRemoteModule } from './vcs-remote';
import { VcsSettingsModule } from './vcs-settings';
import { VcsViewModule } from './vcs-view';
import { VcsEffects } from './vcs.effects';
import { vcsReducerMap } from './vcs.reducer';
import { VcsService } from './vcs.service';


@NgModule({
    imports: [
        UiModule,
        VcsRemoteModule,
        VcsViewModule,
        VcsLocalModule,
        VcsSettingsModule,
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
        VcsService,
        VcsAccountDatabaseProvider,
    ],
    exports: [
        VcsRemoteModule,
        VcsViewModule,
        VcsSettingsModule,
        VcsManagerComponent,
    ],
})
export class VcsModule {
}
