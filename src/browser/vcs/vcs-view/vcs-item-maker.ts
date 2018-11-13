import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { VcsFileChange } from '../../../core/vcs';
import { VcsItemFactory, VcsItemRef } from './vcs-item';


export const VCS_ITEM_MAKING_FACTORIES = new InjectionToken<VcsItemFactory<any>[]>('VcsItemMakingFactories');



@Injectable()
export class VcsItemMaker {
    /** Registered vcs item factories. */
    private readonly factories: VcsItemFactory<any>[];

    constructor(
        @Optional() @Inject(VCS_ITEM_MAKING_FACTORIES) factories: VcsItemFactory<any>[],
    ) {
        if (factories) {
            this.factories = factories;
        } else {
            this.factories = [];
        }
    }

    /** Create vcs item references with given file changes. */
    create(fileChanges: VcsFileChange[]): VcsItemRef<any>[] {
        let refs: VcsItemRef<any>[] = [];
        const _fileChanges = [...fileChanges];

        const discardUsedFileChange = (change: VcsFileChange) => {
            const index = _fileChanges.findIndex(_change => _change.filePath === change.filePath);

            if (index !== -1) {
                _fileChanges.splice(index, 1);
            }
        };

        // Make vcs items from registered factories.
        for (const factory of this.factories) {
            const result = factory.create(_fileChanges);

            refs = refs.concat(result.refs);
            result.usedFileChanges.forEach(usedFileChange => discardUsedFileChange(usedFileChange));
        }

        // TODO: Use default vcs item factory about rest of all file changes.

        return refs;
    }
}
