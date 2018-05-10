import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { debounceTime, map, switchMap, tap } from 'rxjs/operators';
import {
    LoadNoteContentCompleteAction,
    NoteActionTypes,
    SaveNoteContentAction,
} from '../note/actions';
import {
    EditorActions,
    EditorActionTypes,
    InitEditorWithNoteContentAction,
    RemoveSnippetAction,
} from './actions';
import { EditorService } from './editor.service';
import { EditorStateWithRoot } from './reducers';


@Injectable()
export class EditorEffects {
    @Effect()
    initEditor: Observable<Action> = this.actions.pipe(
        ofType<LoadNoteContentCompleteAction>(NoteActionTypes.LOAD_NOTE_CONTENT_COMPLETE),
        tap(action =>
            this.editorService.initFromNoteContent(action.payload.content)),
        map(action =>
            new InitEditorWithNoteContentAction({ content: action.payload.content })),
    );

    @Effect({ dispatch: false })
    removeSnippet: Observable<Action> = this.actions.pipe(
        ofType(EditorActionTypes.REMOVE_SNIPPET),
        tap((action: RemoveSnippetAction) =>
            this.editorService.removeSnippet(action.payload.snippetId)),
    );

    @Effect({ dispatch: false })
    moveFocus: Observable<Action> = this.actions.pipe(
        ofType(
            EditorActionTypes.MOVE_FOCUS_TO_NEXT_SNIPPET,
            EditorActionTypes.MOVE_FOCUS_TO_PREVIOUS_SNIPPET,
        ),
        tap((action: EditorActions) => {
            switch (action.type) {
                case EditorActionTypes.MOVE_FOCUS_TO_PREVIOUS_SNIPPET:
                    this.editorService.moveFocus(action.payload.snippetId, -1);
                    break;

                case EditorActionTypes.MOVE_FOCUS_TO_NEXT_SNIPPET:
                    this.editorService.moveFocus(action.payload.snippetId, 1);
                    break;
            }
        }),
    );

    @Effect()
    saveNoteContent: Observable<Action> = this.actions.pipe(
        ofType(EditorActionTypes.UPDATE_SNIPPET_CONTENT),
        debounceTime(500),
        switchMap(() => this.store.pipe(select(state => state.editor.editor))),
        map(editorState =>
            new SaveNoteContentAction({
                content: {
                    fileName: editorState.fileName,
                    noteId: editorState.noteId,
                    title: editorState.title,
                    snippets: [...editorState.snippets],
                },
            })),
    );

    constructor(
        private readonly actions: Actions,
        private editorService: EditorService,
        private store: Store<EditorStateWithRoot>,
    ) {}
}
