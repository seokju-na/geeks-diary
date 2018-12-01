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
    async create(fileChanges: VcsFileChange[]): Promise<VcsItemRef<any>[]> {
        let refs: VcsItemRef<any>[] = [];

        for await (const _refs of this.pumpRefs(this.factories, fileChanges)) {
            refs = refs.concat(_refs);
        }

        return refs;
    }

    private async* pumpRefs(
        factories: VcsItemFactory<any>[],
        fileChanges: VcsFileChange[],
    ): AsyncIterableIterator<VcsItemRef<any>[]> {

        const _fileChanges = [...fileChanges];
        const discardUsedFileChange = (change: VcsFileChange) => {
            const index = _fileChanges.findIndex(_change => _change.filePath === change.filePath);

            if (index !== -1) {
                _fileChanges.splice(index, 1);
            }
        };

        for (const factory of factories) {
            const result = await factory.create(_fileChanges);
            result.usedFileChanges.forEach(used => discardUsedFileChange(used));

            yield result.refs;
        }
    }
}
