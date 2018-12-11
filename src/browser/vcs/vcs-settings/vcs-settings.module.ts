import { NgModule } from '@angular/core';
import { UiModule } from '../../ui/ui.module';
import { VcsSettingsComponent } from './vcs-settings.component';


@NgModule({
    imports: [
        UiModule,
    ],
    declarations: [VcsSettingsComponent],
    entryComponents: [VcsSettingsComponent],
    exports: [VcsSettingsComponent],
})
export class VcsSettingsModule {
}
