import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '../shared/shared.module';
import { vcsReducerMap } from './shared/vcs-reducers';
import { VcsRepositoryEffects } from './shared/vcs-repository.effects';
import { VcsRepositoryService } from './shared/vcs-repository.service';


@NgModule({
    imports: [
        SharedModule,
        StoreModule.forFeature('vcs', vcsReducerMap),
        EffectsModule.forFeature([
            VcsRepositoryEffects,
        ]),
    ],
    declarations: [],
    providers: [
        VcsRepositoryService,
    ],
    exports: [],
})
export class VcsModule {
}
