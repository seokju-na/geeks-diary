import { Component, Injector, Input, Type } from '@angular/core';


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
export class SidebarComponent {
    @Input() outlets: SidebarOutlet[];

    activeOutletName: string | null = null;

    constructor(public injector: Injector) {
    }

    get showPanel(): boolean {
        return this.activeOutletName !== null;
    }

    clickTab(outlet: SidebarOutlet): void {
        if (this.activeOutletName) {
            this.activeOutletName = null;
        } else {
            this.activeOutletName = outlet.name;
        }
    }

    isActiveOutlet(outlet: SidebarOutlet): boolean {
        if (this.activeOutletName) {
            return this.activeOutletName === outlet.name;
        }

        return false;
    }
}
