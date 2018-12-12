import { NgModule } from '@angular/core';
import { UiModule } from '../ui/ui.module';
import { SettingsDialog } from './settings-dialog/settings-dialog';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';
import { SettingsRegistry } from './settings-registry';


@NgModule({
    imports: [
        UiModule,
    ],
    declarations: [SettingsDialogComponent],
    entryComponents: [
        SettingsDialogComponent,
    ],
    providers: [
        SettingsDialog,
        SettingsRegistry,
    ],
    exports: [SettingsDialogComponent],
})
export class SettingsModule {
}
