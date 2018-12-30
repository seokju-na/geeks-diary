import { Provider } from '@angular/core';
import {
    NOTE_CONTRIBUTION_MEASUREMENT,
    NOTE_CONTRIBUTION_UPDATED_EFFECT_ACTIONS,
    NoteCollectionActionTypes,
} from '../note/note-collection';
import { NOTE_EDITOR_RESIZE_EFFECTS, NoteEditorActionTypes } from '../note/note-editor';
import { NoteVcsItemFactory } from '../note/note-shared';
import { VCS_DETECT_CHANGES_EFFECT_ACTIONS, VCS_HISTORY_CHANGED_EFFECT_ACTIONS, VcsActionTypes } from '../vcs';
import { VcsCommitContributionMeasurement } from '../vcs/vcs-local';
import { BaseVcsItemFactory, VCS_ITEM_MAKING_FACTORIES, VcsItemFactory } from '../vcs/vcs-view';
import { AppLayoutActionTypes } from './app-layout';


export function APP_VCS_ITEM_FACTORIES_PROVIDE_FUNC(
    noteVcsItemFactory: NoteVcsItemFactory,
    baseVcsItemFactory: BaseVcsItemFactory,
): VcsItemFactory<any>[] {
    return [noteVcsItemFactory, baseVcsItemFactory];
}


// NOTE: member order should be 'provide'-'deps'-'useFactory',
//  and DO NOT USE SHORTHAND FUNCTION for useFactory member.
export const AppVcsItemFactoriesProvider: Provider = {
    provide: VCS_ITEM_MAKING_FACTORIES,
    deps: [NoteVcsItemFactory, BaseVcsItemFactory],
    useFactory: APP_VCS_ITEM_FACTORIES_PROVIDE_FUNC,
};


export const AppVcsDetectChangesEffectActionsProvider: Provider = {
    provide: VCS_DETECT_CHANGES_EFFECT_ACTIONS,
    useValue: [
        NoteCollectionActionTypes.LOAD_COLLECTION_COMPLETE,
        NoteCollectionActionTypes.ADD_NOTE,
        NoteEditorActionTypes.SAVE_NOTE_CONTENT_COMPLETE,
        NoteCollectionActionTypes.DELETE_NOTE,
        NoteCollectionActionTypes.CHANGE_NOTE_TITLE,
    ],
};


export const AppVcsHistoryChangedEffectActionsProvider: Provider = {
    provide: VCS_HISTORY_CHANGED_EFFECT_ACTIONS,
    useValue: [
        NoteCollectionActionTypes.LOAD_COLLECTION_COMPLETE, // Initial load
    ],
};


export const AppNoteContributionUpdatedEffectActionsRegistration: Provider = {
    provide: NOTE_CONTRIBUTION_UPDATED_EFFECT_ACTIONS,
    useValue: [
        NoteCollectionActionTypes.LOAD_COLLECTION_COMPLETE,
        VcsActionTypes.COMMITTED,
        VcsActionTypes.SYNCHRONIZED,
        NoteCollectionActionTypes.DELETE_NOTE,
    ],
};


export const AppNoteContributionMeasurementProvider: Provider = {
    provide: NOTE_CONTRIBUTION_MEASUREMENT,
    useClass: VcsCommitContributionMeasurement,
};


export const AppNoteEditorResizeEffectsProvider: Provider = {
    provide: NOTE_EDITOR_RESIZE_EFFECTS,
    useValue: [
        AppLayoutActionTypes.TOGGLE_SIDENAV_PANEL,
        AppLayoutActionTypes.RESIZE_SIDENAV_PANEL,
    ],
};
