import { Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { AppState } from './app-reducers';
import { SidebarOutlet } from './core/sidebar/sidebar.component';
import { NoteFinderComponent } from './note/finder/finder.component';


@Component({
    selector: 'gd-app-shell',
    templateUrl: './app-shell.component.html',
    styleUrls: ['./app-shell.component.less'],
})
export class AppShellComponent {
    sidebarOutlets: SidebarOutlet[] = [
        {
            name: 'noteFinder',
            component: NoteFinderComponent,
            description: 'Notes (⌘+1)',
            iconName: 'folder',
        },
    ];
    sidebarOpened: Observable<boolean>;

    constructor(private store: Store<AppState>) {
        this.sidebarOpened = this.store.pipe(select(state => state.layout.showSidebar));
    }
}
