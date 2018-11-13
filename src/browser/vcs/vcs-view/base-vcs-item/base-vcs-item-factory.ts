import { Injectable } from '@angular/core';
import { VcsFileChange } from '../../../../core/vcs';
import { VcsItemConfig, VcsItemCreateResult, VcsItemFactory, VcsItemRef } from '../vcs-item';
import { BaseVcsItemComponent } from './base-vcs-item.component';


@Injectable()
export class BaseVcsItemFactory extends VcsItemFactory<BaseVcsItemComponent> {
    create(fileChanges: VcsFileChange[]): VcsItemCreateResult<BaseVcsItemComponent> {
        const usedFileChanges: VcsFileChange[] = [];
        const refs: VcsItemRef<BaseVcsItemComponent>[] = [];

        for (const fileChange of fileChanges) {
            const config: VcsItemConfig = {
                fileChanges: [fileChange],
            };

            const ref = new VcsItemRef<BaseVcsItemComponent>(config);
            ref.component = BaseVcsItemComponent;

            usedFileChanges.push(fileChange);
            refs.push(ref);
        }

        return { refs, usedFileChanges };
    }
}
