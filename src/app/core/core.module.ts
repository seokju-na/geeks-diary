import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { FsService } from './fs.service';
import { LoadingDialog } from './loading-dialog/loading-dialog';
import { LoadingDialogComponent } from './loading-dialog/loading-dialog.component';
import { MonacoService } from './monaco.service';
import { SidebarComponent } from './sidebar/sidebar.component';
import { UserDataService } from './user-data.service';


@NgModule({
    imports: [
        SharedModule,
    ],
    declarations: [
        LoadingDialogComponent,
        SidebarComponent,
    ],
    entryComponents: [
        LoadingDialogComponent,
    ],
    providers: [
        FsService,
        MonacoService,
        LoadingDialog,
        UserDataService,
    ],
    exports: [
        LoadingDialogComponent,
        SidebarComponent,
    ],
})
export class CoreModule {
}
