import { Component, Inject } from '@angular/core';
import { WORKSPACE_DATABASE, WorkspaceDatabase } from '../shared';
import { Themes, ThemeService } from '../ui/style';


@Component({
    selector: 'gd-wizard',
    templateUrl: './wizard.component.html',
    styleUrls: ['./wizard.component.scss'],
})
export class WizardComponent {
    constructor(
        theme: ThemeService,
        @Inject(WORKSPACE_DATABASE) workspaceDB: WorkspaceDatabase,
    ) {
        const _theme = workspaceDB.cachedInfo
            ? workspaceDB.cachedInfo.theme as Themes
            : ThemeService.defaultTheme;

        theme.setTheme(_theme);
        workspaceDB.update({ theme: _theme });
    }
}
