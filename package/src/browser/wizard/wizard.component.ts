import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { from } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { ConfirmDialog } from '../core/confirm-dialog/confirm-dialog';
import { Themes, ThemeService } from '../core/theme.service';
import { WORKSPACE_DATABASE, WorkspaceDatabase } from '../core/workspace-database';
import { WorkspaceService } from '../core/workspace.service';


export type WizardProcessSteps = 'choosing' | 'cloneRemote';


@Component({
    selector: 'gd-wizard',
    templateUrl: './wizard.component.html',
    styleUrls: ['./wizard.component.scss'],
})
export class WizardComponent implements OnInit {
    step: WizardProcessSteps = 'choosing';

    readonly themeControl = new FormControl();
    readonly themeOptions = [
        { name: 'Light Theme', value: Themes.BASIC_LIGHT_THEME },
        { name: 'Dark Theme', value: Themes.BASIC_DARK_THEME },
    ];

    constructor(
        private theme: ThemeService,
        private workspace: WorkspaceService,
        private confirmDialog: ConfirmDialog,
        @Inject(WORKSPACE_DATABASE) private workspaceDB: WorkspaceDatabase,
    ) {

        const _theme = workspaceDB.cachedInfo
            ? workspaceDB.cachedInfo.theme as Themes
            : ThemeService.defaultTheme;

        this.theme.setTheme(_theme);
    }

    ngOnInit(): void {
        this.themeControl.patchValue(this.theme.currentTheme);
        this.themeControl.valueChanges.pipe(
            tap(theme => this.theme.setTheme(theme)),
            // Saving value in database cost IO.
            // We need to throttle events.
            debounceTime(50),
            switchMap(theme =>
                from(this.workspaceDB.update({ theme })),
            ),
        ).subscribe();
    }

    stepTo(step: WizardProcessSteps): void {
        this.step = step;
    }

    createNewWorkspace(): void {
        this.workspace.initWorkspace().subscribe(
            () => this.handleSuccess(),
            error => this.handleError(error),
        );
    }

    private handleSuccess(): void {
        // We don't have to handle anything.
        // After workspace initialized successfully,
        // in main-process, will automatically navigate
        // window browser.
    }

    private handleError(error: any): void {
        // TODO: Handle error more smartly...
        this.confirmDialog.openAlert({
            title: 'Error',
            content: error.message ? error.message : 'Unknown Error',
        });
    }
}
