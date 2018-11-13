import { AfterViewInit, Component, ElementRef, ViewChild, ViewContainerRef } from '@angular/core';
import { createDummies } from '../../../../../test/helpers';
import { WORKSPACE_DIR_PATH } from '../../../../core/workspace';
import { VcsFileChangeDummy } from '../../dummies';
import { VcsItemListManager } from '../vcs-item-list-manager';


@Component({
    selector: 'gd-vcs-manager',
    templateUrl: './vcs-manager.component.html',
    styleUrls: ['./vcs-manager.component.scss'],
})
export class VcsManagerComponent implements AfterViewInit {
    @ViewChild('itemList') itemList: ElementRef<HTMLElement>;

    constructor(
        private itemListManager: VcsItemListManager,
        private viewContainerRef: ViewContainerRef,
    ) {
    }

    ngAfterViewInit(): void {
        this.itemListManager
            .setViewContainerRef(this.viewContainerRef)
            .setContainerElement(this.itemList.nativeElement);

        Promise.resolve(null).then(() => {
            this.itemListManager.initWithFileChanges(
                createDummies(new VcsFileChangeDummy(WORKSPACE_DIR_PATH), 20),
            );
        });
    }
}
