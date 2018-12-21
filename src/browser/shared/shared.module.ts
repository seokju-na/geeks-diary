import { CommonModule } from '@angular/common';
import { ErrorHandler, NgModule } from '@angular/core';
import { ChangeFileNameDialogModule } from './change-file-name-dialog';
import { ConfirmDialogModule } from './confirm-dialog';
import { FsService } from './fs.service';
import { GitService } from './git.service';
import { GlobalErrorHandler } from './global-error-handler';
import { MenuService } from './menu.service';
import { NativeDialog } from './native-dialog';
import { ThemeService } from './theme.service';
import { WorkspaceDatabaseProvider } from './workspace-database';
import { WorkspaceService } from './workspace.service';


@NgModule({
    imports: [
        CommonModule,
        ConfirmDialogModule,
        ChangeFileNameDialogModule,
    ],
    providers: [
        FsService,
        WorkspaceService,
        WorkspaceDatabaseProvider,
        GitService,
        MenuService,
        NativeDialog,
        ThemeService,
        {
            provide: ErrorHandler,
            useClass: GlobalErrorHandler,
        },
    ],
    exports: [
        ConfirmDialogModule,
        ChangeFileNameDialogModule,
    ],
})
export class SharedModule {
}
