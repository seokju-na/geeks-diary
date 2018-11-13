import { Component, Inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { NoteFinderComponent } from '../note/note-collection';
import { NoteCollectionService } from '../note/note-collection/note-collection.service';
import { MenuEvent, MenuService, WORKSPACE_DATABASE, WorkspaceDatabase } from '../shared';
import { Themes, ThemeService } from '../ui/style';
import { VcsManagerComponent } from '../vcs/vcs-view';
import { AppLayoutSidenavOutlet, ToggleSidenavPanelAction } from './app-layout';
import { AppStateWithFeatures } from './app.state';


@Component({
    selector: 'gd-app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    readonly sidenavOutlets: AppLayoutSidenavOutlet[] = [
        {
            id: 'gd-note-finder',
            name: 'Notes',
            iconName: 'folder',
            shortcut: '',
            description: 'Notes (⌘+1)',
            outletComponent: NoteFinderComponent,
        },
        {
            id: 'gd-vcs-manager',
            name: 'Version Control',
            iconName: 'git',
            shortcut: '',
            description: 'Version Control (⌘+2)',
            outletComponent: VcsManagerComponent,
        },
    ];

    readonly noteContentLoaded: Observable<boolean> = this.store.pipe(
        map(state => state.note.editor.loaded),
    );

    constructor(
        private collection: NoteCollectionService,
        private store: Store<AppStateWithFeatures>,
        theme: ThemeService,
        @Inject(WORKSPACE_DATABASE) workspaceDB: WorkspaceDatabase,
        private menu: MenuService,
    ) {
        const _theme = workspaceDB.cachedInfo
            ? workspaceDB.cachedInfo.theme as Themes
            : ThemeService.defaultTheme;

        theme.setTheme(_theme);
        workspaceDB.update({ theme: _theme });
    }

    ngOnInit(): void {
        this.collection.loadOnce();

        this.menu.onMessage().pipe(
            filter(event =>
                event === MenuEvent.TOGGLE_NOTE_LIST
                || event === MenuEvent.TOGGLE_VCS,
            ),
        ).subscribe((event) => {
            switch (event) {
                case MenuEvent.TOGGLE_NOTE_LIST:
                    this.store.dispatch(new ToggleSidenavPanelAction({ outletId: 'gd-note-finder' }));
                    break;

                case MenuEvent.TOGGLE_VCS:
                    this.store.dispatch(new ToggleSidenavPanelAction({ outletId: 'gd-vcs-manager' }));
                    break;
            }
        });
    }
}
