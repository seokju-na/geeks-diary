import { Provider } from '@angular/core';
import { BaseVcsItemFactory, VCS_ITEM_MAKING_FACTORIES, VcsItemFactory } from '../vcs/vcs-view';


export const AppVcsItemFactoriesProvider: Provider = {
    provide: VCS_ITEM_MAKING_FACTORIES,
    useFactory(baseVcsItemFactory: BaseVcsItemFactory): VcsItemFactory<any>[] {
        return [baseVcsItemFactory];
    },
    deps: [BaseVcsItemFactory],
};
