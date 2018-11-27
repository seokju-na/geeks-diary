import { Provider } from '@angular/core';
import { NoteCollectionActionTypes } from '../note/note-collection';
import { NoteEditorActionTypes } from '../note/note-editor';
import { NoteVcsItemFactory } from '../note/note-shared';
import { VCS_DETECT_CHANGES_EFFECT_ACTIONS, VCS_HISTORY_CHANGED_EFFECT_ACTIONS } from '../vcs';
import { BaseVcsItemFactory, VCS_ITEM_MAKING_FACTORIES, VcsItemFactory } from '../vcs/vcs-view';


export const AppVcsItemFactoriesProvider: Provider = {
    provide: VCS_ITEM_MAKING_FACTORIES,
    useFactory(
        noteVcsItemFactory: NoteVcsItemFactory,
        baseVcsItemFactory: BaseVcsItemFactory,
    ): VcsItemFactory<any>[] {
        // 1. Note related files
        // 2. Others... (asset etc.)
        return [noteVcsItemFactory, baseVcsItemFactory];
    },
    deps: [NoteVcsItemFactory, BaseVcsItemFactory],
};


export const AppVcsDetectChangesEffectActionsProvider: Provider = {
    provide: VCS_DETECT_CHANGES_EFFECT_ACTIONS,
    useValue: [
        NoteCollectionActionTypes.LOAD_COLLECTION_COMPLETE,
        NoteCollectionActionTypes.ADD_NOTE,
        NoteEditorActionTypes.SAVE_NOTE_CONTENT_COMPLETE,
    ],
};


export const AppVcsHistoryChangedEffectActionsProvider: Provider = {
    provide: VCS_HISTORY_CHANGED_EFFECT_ACTIONS,
    useValue: [
        NoteCollectionActionTypes.LOAD_COLLECTION_COMPLETE, // Initial load
    ],
};
