import { Component, Injector, Input, OnInit, Type } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { share } from 'rxjs/operators';
import { AppState } from '../../app-reducers';
import { ToggleSidebarAction } from '../actions';


export interface SidebarOutlet {
    component: Type<any>;
    name: string;
    description: string; // For tooltip message
    iconName: string;
}


@Component({
    selector: 'gd-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.less'],
})
export class SidebarComponent implements OnInit {
    @Input() outlets: SidebarOutlet[];

    showPanel: Observable<boolean>;
    activeOutletName: Observable<string | null>;

    constructor(public injector: Injector,
                private store: Store<AppState>) {
    }

    ngOnInit(): void {
        this.showPanel = this.store.pipe(
            select(state => state.layout.showSidebar),
        );

        this.activeOutletName = this.store.pipe(
            select(state => state.layout.activeSidebarOutletName),
            share(),
        );
    }

    clickTab(outlet: SidebarOutlet): void {
        this.store.dispatch(new ToggleSidebarAction(outlet.name));
    }
}
