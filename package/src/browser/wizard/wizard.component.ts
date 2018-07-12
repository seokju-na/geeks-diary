import { Component, OnInit } from '@angular/core';
import { Themes, ThemeService } from '../core/theme.service';
import { workspaceDatabase } from '../core/workspace-database';


export type WizardProcessSteps = 'choosing' | 'cloneRemote';


@Component({
    selector: 'gd-wizard',
    templateUrl: './wizard.component.html',
    styleUrls: ['./wizard.component.scss'],
})
export class WizardComponent implements OnInit {
    step: WizardProcessSteps = 'choosing';

    constructor(private theme: ThemeService) {
        this.theme.setTheme(workspaceDatabase.cachedInfo.theme as Themes);
    }

    async ngOnInit(): Promise<void> {
    }

    stepTo(step: WizardProcessSteps): void {
        this.step = step;
    }
}
