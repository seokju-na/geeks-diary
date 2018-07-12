import { Component, OnInit } from '@angular/core';
import { Themes, ThemeService } from '../core/theme.service';
import { workspaceDatabase } from '../core/workspace-database';
import { NoteFinderComponent } from '../note/note-finder/note-finder.component';
import { Dialog } from '../ui/dialog/dialog';
import { AppService } from './shared/app-service.model';


@Component({
    selector: 'gd-app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    readonly appServices: AppService[] = [
        {
            id: 'gd-note-finder',
            name: 'Notes',
            iconName: 'folder',
            shortcut: '⌘+1',
            description: 'Notes (⌘+1)',
            outletComponent: NoteFinderComponent,
        },
    ];

    constructor(
        private dialog: Dialog,
        private theme: ThemeService,
    ) {
        this.theme.setTheme(workspaceDatabase.cachedInfo.theme as Themes);
    }

    async ngOnInit(): Promise<void> {

    }
}
