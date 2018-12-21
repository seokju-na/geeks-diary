import { CommonModule } from '@angular/common';
import { ErrorHandler, NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { ChangeFileNameDialogModule } from './change-file-name-dialog';
import { ConfirmDialogModule } from './confirm-dialog';
import { ErrorCollectEffects } from './error-collect.effects';
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
        EffectsModule.forFeature([ErrorCollectEffects]),
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
