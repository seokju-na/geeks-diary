import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AuthenticationDatabaseProvider } from './authentication-database';
import { ConfirmDialogModule } from './confirm-dialog';
import { FsService } from './fs.service';
import { GitService } from './git.service';
import { WorkspaceDatabaseProvider } from './workspace-database';
import { WorkspaceService } from './workspace.service';


@NgModule({
    imports: [
        CommonModule,
        ConfirmDialogModule,
    ],
    declarations: [],
    providers: [
        FsService,
        WorkspaceService,
        WorkspaceDatabaseProvider,
        AuthenticationDatabaseProvider,
        GitService,
    ],
    exports: [
        ConfirmDialogModule,
    ],
})
export class SharedModule {
}
