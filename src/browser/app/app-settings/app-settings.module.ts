import { NgModule } from '@angular/core';
import { SETTINGS_REGISTRATION, SettingsContext } from '../../settings';
import { UiModule } from '../../ui/ui.module';
import { vcsSettingsContext } from '../../vcs/vcs-settings';
import { GeneralSettingsComponent } from './general-settings/general-settings.component';


const generalSettingsContext: SettingsContext<GeneralSettingsComponent> = {
    id: 'settings.general',
    tabName: 'General',
    component: GeneralSettingsComponent,
};


@NgModule({
    imports: [
        UiModule,
    ],
    declarations: [
        GeneralSettingsComponent,
    ],
    entryComponents: [
        GeneralSettingsComponent,
    ],
    providers: [
        {
            provide: SETTINGS_REGISTRATION,
            useValue: [
                generalSettingsContext,
                vcsSettingsContext,
            ] as SettingsContext<any>[],
        },
    ],
    exports: [
        GeneralSettingsComponent,
    ],
})
export class AppSettingsModule {
}
