import { Component, Inject } from '@angular/core';
import { ThemeService, WORKSPACE_DATABASE, WorkspaceDatabase } from '../shared';
import { defaultTheme, Themes } from '../ui/style';


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
            : defaultTheme;

        theme.applyThemeToHtml(_theme);
        workspaceDB.update({ theme: _theme });
    }
}
