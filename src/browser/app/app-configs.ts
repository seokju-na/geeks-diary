import { Provider } from '@angular/core';
import { NoteCollectionActionTypes } from '../note/note-collection';
import { NoteEditorActionTypes } from '../note/note-editor';
import { VCS_DETECT_CHANGES_EFFECT_ACTIONS } from '../vcs';
import { BaseVcsItemFactory, VCS_ITEM_MAKING_FACTORIES, VcsItemFactory } from '../vcs/vcs-view';


export const AppVcsItemFactoriesProvider: Provider = {
    provide: VCS_ITEM_MAKING_FACTORIES,
    useFactory(baseVcsItemFactory: BaseVcsItemFactory): VcsItemFactory<any>[] {
        return [baseVcsItemFactory];
    },
    deps: [BaseVcsItemFactory],
};


export const AppVcsDetectChangesEffectActionsProvider: Provider = {
    provide: VCS_DETECT_CHANGES_EFFECT_ACTIONS,
    useValue: [
        NoteCollectionActionTypes.LOAD_COLLECTION,
        NoteCollectionActionTypes.ADD_NOTE,
        NoteEditorActionTypes.SAVE_NOTE_CONTENT_COMPLETE,
    ],
};
