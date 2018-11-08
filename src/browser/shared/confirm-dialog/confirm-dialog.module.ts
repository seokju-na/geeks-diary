import { NgModule } from '@angular/core';
import { UiModule } from '../../ui/ui.module';
import { ConfirmDialog } from './confirm-dialog';
import { ConfirmDialogComponent } from './confirm-dialog.component';


@NgModule({
    imports: [
        UiModule,
    ],
    declarations: [
        ConfirmDialogComponent,
    ],
    entryComponents: [
        ConfirmDialogComponent,
    ],
    providers: [
        ConfirmDialog,
    ],
    exports: [
        ConfirmDialogComponent,
    ],
})
export class ConfirmDialogModule {
}
