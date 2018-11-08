import { NgModule } from '@angular/core';
import { UiModule } from '../../ui/ui.module';
import { VcsManagerComponent } from './vcs-manager/vcs-manager.component';


@NgModule({
    imports: [
        UiModule,
    ],
    declarations: [
        VcsManagerComponent,
    ],
    entryComponents: [
        VcsManagerComponent,
    ],
    exports: [
        VcsManagerComponent,
    ],
})
export class VcsViewModule {
}
