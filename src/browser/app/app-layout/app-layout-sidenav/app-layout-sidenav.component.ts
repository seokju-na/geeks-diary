import { Component, Injector, Input, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, share } from 'rxjs/operators';
import { SettingsDialog } from '../../../settings';
import { MenuEvent, MenuService } from '../../../shared';
import { AppState } from '../../app.state';
import { ToggleSidenavPanelAction } from '../app-layout.actions';
import { AppLayoutSidenavOutlet } from '../app-layout.state';


@Component({
    selector: 'gd-app-layout-sidenav',
    templateUrl: './app-layout-sidenav.component.html',
    styleUrls: ['./app-layout-sidenav.component.scss'],
})
export class AppLayoutSidenavComponent implements OnInit {
    @Input() outlets: AppLayoutSidenavOutlet[];

    readonly showPanel: Observable<boolean> = this.store.pipe(
        select(state => state.layout.showSidenavPanel),
        share(),
    );

    readonly activeTabId: Observable<string | null> = this.store.pipe(
        select(state => state.layout.activeOutletId),
        share(),
    );

    constructor(
        private store: Store<AppState>,
        public _injector: Injector,
        private settingsDialog: SettingsDialog,
        private menu: MenuService,
    ) {
    }

    ngOnInit(): void {
        this.menu.onMessage().pipe(
            filter(event => event === MenuEvent.OPEN_SETTINGS),
        ).subscribe(() => this.openSettingsDialog());
    }

    toggleServicePanel(outletId: string): void {
        this.store.dispatch(new ToggleSidenavPanelAction({ outletId }));
    }

    openSettingsDialog(): void {
        this.settingsDialog.open();
    }
}
