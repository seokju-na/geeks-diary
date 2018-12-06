import { Component, Inject, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { NoteFinderComponent } from '../note/note-collection';
import { NoteCollectionService } from '../note/note-collection/note-collection.service';
import { ChangeViewModeAction, NoteEditorViewModes } from '../note/note-editor';
import { MenuEvent, MenuService, ThemeService, WORKSPACE_DATABASE, WorkspaceDatabase } from '../shared';
import { defaultTheme, Themes } from '../ui/style';
import { VcsManagerComponent, VcsService } from '../vcs';
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

    readonly noteEditorViewModeAsClassName: Observable<string> = this.store.pipe(
        select(state => state.note.editor.viewMode),
        map((viewMode) => {
            switch (viewMode) {
                case NoteEditorViewModes.PREVIEW_ONLY:
                    return 'previewOnly';
                case NoteEditorViewModes.EDITOR_ONLY:
                    return 'editorOnly';
                case NoteEditorViewModes.SHOW_BOTH:
                    return 'showBoth';
            }
        }),
    );

    constructor(
        private collection: NoteCollectionService,
        private store: Store<AppStateWithFeatures>,
        theme: ThemeService,
        @Inject(WORKSPACE_DATABASE) workspaceDB: WorkspaceDatabase,
        private menu: MenuService,
        private vcs: VcsService,
    ) {
        const _theme = workspaceDB.cachedInfo
            ? workspaceDB.cachedInfo.theme as Themes
            : defaultTheme;

        theme.applyThemeToHtml(_theme);
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

        this.vcs.setCommitHistoryFetchingSize(100);

        // FIXME LATER
        this.store.dispatch(new ChangeViewModeAction({ viewMode: NoteEditorViewModes.SHOW_BOTH }));
    }
}
