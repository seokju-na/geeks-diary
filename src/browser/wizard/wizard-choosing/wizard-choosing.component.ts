import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { environment } from '../../../core/environment';
import { logMonitor } from '../../../core/log-monitor';
import { WorkspaceError } from '../../../core/workspace';
import { ThemeService, WorkspaceService } from '../../shared';
import { ConfirmDialog } from '../../shared/confirm-dialog';
import { Themes } from '../../ui/style';


@Component({
    selector: 'gd-wizard-choosing',
    templateUrl: './wizard-choosing.component.html',
    styleUrls: ['./wizard-choosing.component.scss'],
})
export class WizardChoosingComponent implements OnInit, OnDestroy {
    readonly appVersion = environment.version;

    readonly themeFormControl = new FormControl();
    readonly themeOptions = [
        { name: 'Light Theme', value: Themes.BASIC_LIGHT_THEME },
        { name: 'Dark Theme', value: Themes.BASIC_DARK_THEME },
    ];

    readonly logMonitorStateControl = new FormControl();

    private themeSetSubscription = Subscription.EMPTY;
    private logMonitorStateUpdateSubscription = Subscription.EMPTY;

    constructor(
        private theme: ThemeService,
        private workspace: WorkspaceService,
        private confirmDialog: ConfirmDialog,
    ) {
    }

    ngOnInit(): void {
        this.themeFormControl.patchValue(this.theme.currentTheme);
        this.themeSetSubscription = this.themeFormControl.valueChanges.subscribe(this.theme.setTheme);

        this.logMonitorStateControl.patchValue(logMonitor.enabled);
        this.logMonitorStateUpdateSubscription = this.logMonitorStateControl
            .valueChanges.subscribe((enabled) => {
                if (enabled) {
                    logMonitor.enable();
                } else {
                    logMonitor.disable();
                }
            });
    }

    ngOnDestroy(): void {
        this.themeSetSubscription.unsubscribe();
        this.logMonitorStateUpdateSubscription.unsubscribe();
    }

    createNewWorkspace(): void {
        this.workspace.initWorkspace().subscribe(
            () => {
            },
            error => this.handleInitWorkspaceFail(error),
        );
    }

    private handleInitWorkspaceFail(error: any): void {
        this.confirmDialog.open({
            title: 'Workspace Error',
            isAlert: true,
            body: (error as WorkspaceError).message,
        });
    }
}
