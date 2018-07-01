import { Component, OnInit } from '@angular/core';


interface VcsServiceTab {
    name: string;
    value: 'vcs-changes' | 'vcs-history';
}


@Component({
    selector: 'gd-vcs-manager',
    templateUrl: './vcs-manager.component.html',
    styleUrls: ['./vcs-manager.component.less'],
})
export class VcsManagerComponent implements OnInit {
    serviceTabs: VcsServiceTab[] = [
        { name: 'Changes', value: 'vcs-changes' },
        { name: 'History', value: 'vcs-history' },
    ];
    currentServiceTabSelection = this.serviceTabs[0];

    constructor() {
    }

    ngOnInit(): void {
    }

    isTabSelected(tab: VcsServiceTab): boolean {
        return this.currentServiceTabSelection.value === tab.value;
    }

    selectTab(tab: VcsServiceTab): void {
        this.currentServiceTabSelection = tab;
    }
}
