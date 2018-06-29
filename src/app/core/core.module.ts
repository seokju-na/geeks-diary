import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { FsService } from './fs.service';
import { LoadingDialog } from './loading-dialog/loading-dialog';
import { LoadingDialogComponent } from './loading-dialog/loading-dialog.component';
import { MonacoService } from './monaco.service';
import { GitService } from './git.service';
import { SidebarComponent } from './sidebar/sidebar.component';
import { UserDataService } from './user-data.service';
import { WorkspaceService } from './workspace.service';
import { WorkspaceInitDialogComponent } from './workspace-init-dialog/workspace-init-dialog.component';


@NgModule({
    imports: [
        SharedModule,
    ],
    declarations: [
        LoadingDialogComponent,
        SidebarComponent,
        WorkspaceInitDialogComponent,
    ],
    entryComponents: [
        LoadingDialogComponent,
        WorkspaceInitDialogComponent,
    ],
    providers: [
        FsService,
        MonacoService,
        LoadingDialog,
        UserDataService,
        GitService,
        WorkspaceService,
    ],
    exports: [
        LoadingDialogComponent,
        WorkspaceInitDialogComponent,
        SidebarComponent,
    ],
})
export class CoreModule {
}
