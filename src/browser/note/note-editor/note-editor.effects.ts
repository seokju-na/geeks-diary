import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { map, tap } from 'rxjs/operators';
import { MenuService } from '../../shared';
import { NoteCollectionActionTypes, SelectNoteAction } from '../note-collection';
import {
    ChangeViewModeAction,
    LoadNoteContentAction,
    LoadNoteContentCompleteAction,
    NoteEditorActionTypes,
} from './note-editor.actions';
import { NoteEditorViewModes } from './note-editor.state';
import { NoteSnippetListManager } from './note-snippet-list-manager';


@Injectable()
export class NoteEditorEffects {
    @Effect()
    loadNoteContentWhenNoteSelected = this.actions.pipe(
        ofType(NoteCollectionActionTypes.SELECT_NOTE),
        map((action: SelectNoteAction) => new LoadNoteContentAction({ note: action.payload.note })),
    );

    @Effect({ dispatch: false })
    disposeEditor = this.actions.pipe(
        ofType(NoteCollectionActionTypes.DESELECT_NOTE),
        tap(() => {
            this.snippetListManager.removeAllSnippets();
        }),
    );

    @Effect({ dispatch: false })
    afterNoteContentLoaded = this.actions.pipe(
        ofType(NoteEditorActionTypes.LOAD_NOTE_CONTENT_COMPLETE),
        tap((action: LoadNoteContentCompleteAction) => {
            this.snippetListManager.removeAllSnippets();
            this.snippetListManager.addAllSnippetsFromContent(action.payload.content);
        }),
    );

    @Effect({ dispatch: false })
    updateNoteViewMenuState = this.actions.pipe(
        ofType(NoteEditorActionTypes.CHANGE_VIEW_MODE),
        tap((action: ChangeViewModeAction) => {
            let activeMode: 'note-view-show-both' | 'note-view-editor-only' | 'note-view-preview-only';

            switch (action.payload.viewMode) {
                case NoteEditorViewModes.SHOW_BOTH:
                    activeMode = 'note-view-show-both';
                    break;
                case NoteEditorViewModes.PREVIEW_ONLY:
                    activeMode = 'note-view-preview-only';
                    break;
                case NoteEditorViewModes.EDITOR_ONLY:
                    activeMode = 'note-view-editor-only';
                    break;
            }

            this.menu.updateNoteEditorViewMenuState(activeMode);
        }),
    );

    constructor(
        private actions: Actions,
        private snippetListManager: NoteSnippetListManager,
        private menu: MenuService,
    ) {
    }
}
