import { Component, Injector, Input, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { share } from 'rxjs/operators';
import { ToggleSidenavPanelAction } from '../shared/app-layout.actions';
import { AppService } from '../shared/app-service.model';
import { AppState } from '../shared/app.state';


@Component({
    selector: 'gd-sidenav',
    templateUrl: './sidenav.component.html',
    styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnInit {
    @Input() services: AppService[];

    readonly showPanel: Observable<boolean> = this.store.pipe(
        select(state => state.layout.showSidenavPanel),
        share(),
    );

    readonly activeTabId: Observable<string> = this.store.pipe(
        select(state => state.layout.activeTabId),
        share(),
    );

    constructor(
        public _injector: Injector,
        private store: Store<AppState>,
    ) {
    }

    ngOnInit(): void {
    }

    toggleServicePanel(service: AppService): void {
        this.store.dispatch(new ToggleSidenavPanelAction({ tabId: service.id }));
    }

}
