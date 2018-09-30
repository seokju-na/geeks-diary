import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { from } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../core/environment';
import { WORKSPACE_DATABASE, WorkspaceDatabase, WorkspaceService } from '../../shared';
import { ConfirmDialog } from '../../shared/confirm-dialog';
import { Themes, ThemeService } from '../../ui/style';


@Component({
    selector: 'gd-wizard-choosing',
    templateUrl: './wizard-choosing.component.html',
    styleUrls: ['./wizard-choosing.component.scss'],
})
export class WizardChoosingComponent implements OnInit {
    readonly appVersion = environment.version;

    readonly themeFormControl = new FormControl();
    readonly themeOptions = [
        { name: 'Light Theme', value: Themes.BASIC_LIGHT_THEME },
        { name: 'Dark Theme', value: Themes.BASIC_DARK_THEME },
    ];

    constructor(
        private theme: ThemeService,
        private workspace: WorkspaceService,
        @Inject(WORKSPACE_DATABASE) private workspaceDB: WorkspaceDatabase,
        private confirmDialog: ConfirmDialog,
    ) {
    }

    ngOnInit(): void {
        this.themeFormControl.patchValue(this.theme.currentTheme);
        this.themeFormControl.valueChanges.pipe(
            tap(theme => this.theme.setTheme(theme)),
            distinctUntilChanged(),
            // Saving value in database cost IO. We need to throttle events.
            debounceTime(50),
            switchMap(theme =>
                from(this.workspaceDB.update({ theme })),
            ),
        ).subscribe();
    }

}
