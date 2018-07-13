import { NgModule } from '@angular/core';
import { UIModule } from '../ui/ui.module';
import { TitleBarComponent } from './title-bar/title-bar.component';
import { WorkspaceDatabaseProvider } from './workspace-database';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';


@NgModule({
    imports: [
        UIModule,
    ],
    declarations: [
        TitleBarComponent,
        ConfirmDialogComponent,
    ],
    entryComponents: [
        ConfirmDialogComponent,
    ],
    providers: [
        WorkspaceDatabaseProvider,
    ],
    exports: [
        TitleBarComponent,
        ConfirmDialogComponent,
    ],
})
export class CoreModule {
}
