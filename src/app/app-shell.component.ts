import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { AppState } from './app-reducers';
import { LoadUserDataAction } from './core/actions';
import { SidebarOutlet } from './core/sidebar/sidebar.component';
import { WorkspaceInitDialogComponent } from './core/workspace-init-dialog/workspace-init-dialog.component';
import { WorkspaceService } from './core/workspace.service';
import { GetNoteCollectionAction } from './note/actions';
import { NoteFinderComponent } from './note/finder/finder.component';
import { NoteSelectionService } from './note/shared/note-selection.service';
import { Dialog } from './shared/dialog/dialog';
import { GetVcsRepositoryFileStatues } from './vcs/shared/vcs-repository.actions';


@Component({
    selector: 'gd-app-shell',
    templateUrl: './app-shell.component.html',
    styleUrls: ['./app-shell.component.less'],
})
export class AppShellComponent implements OnInit {
    sidebarOutlets: SidebarOutlet[] = [
        {
            name: 'noteFinder',
            component: NoteFinderComponent,
            description: 'Notes (⌘+1)',
            iconName: 'folder',
        },
    ];
    sidebarOpened: Observable<boolean>;

    constructor(
        private store: Store<AppState>,
        private dialog: Dialog,
        private workspace: WorkspaceService,
        private noteSelectionService: NoteSelectionService,
        private changeDetector: ChangeDetectorRef,
    ) {

        this.sidebarOpened = this.store.pipe(select(state => state.layout.showSidebar));
    }

    ngOnInit(): void {
        this.afterUserDataLoaded().subscribe(async () => {
            if (await this.workspace.isReady()) {
                this.init();
            } else {
                this.openWorkspaceInitDialog();
            }
        });

        this.store.dispatch(new LoadUserDataAction());
    }

    private afterUserDataLoaded(): Observable<any> {
        return this.store.pipe(
            select(state => state.userData.loaded),
            filter(userDataLoaded => userDataLoaded),
            take(1),
        );
    }

    private init(): void {
        this.store.dispatch(new GetVcsRepositoryFileStatues());
        this.store.dispatch(new GetNoteCollectionAction());
        this.noteSelectionService.selectLastOpenedNote();

        this.changeDetector.detectChanges();
    }

    private openWorkspaceInitDialog(): void {
        this.dialog
            .open(WorkspaceInitDialogComponent, {
                width: '400px',
                closeOnEscape: false,
                disableClose: true,
            })
            .afterClosed()
            .subscribe(() => {
                this.init();
            });
    }
}
