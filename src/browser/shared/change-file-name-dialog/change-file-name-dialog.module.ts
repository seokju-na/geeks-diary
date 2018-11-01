import { NgModule } from '@angular/core';
import { UiModule } from '../../ui/ui.module';
import { ChangeFileNameDialog } from './change-file-name-dialog';
import { ChangeFileNameDialogComponent } from './change-file-name-dialog.component';


@NgModule({
    imports: [
        UiModule,
    ],
    declarations: [
        ChangeFileNameDialogComponent,
    ],
    entryComponents: [
        ChangeFileNameDialogComponent,
    ],
    providers: [
        ChangeFileNameDialog,
    ],
    exports: [
        ChangeFileNameDialogComponent,
    ],
})
export class ChangeFileNameDialogModule {
}
