import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { zip } from 'rxjs/observable/zip';
import { catchError, debounceTime, filter, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import {
    AddNoteAction,
    AddNoteCompleteAction,
    AddNoteErrorAction, ChangeDateFilterAction,
    GetNoteCollectionCompleteAction,
    InitEditorAction,
    InsertNewSnippetAction,
    LoadNoteContentAction,
    LoadNoteContentCompleteAction,
    NoteActions,
    NoteActionTypes,
    RemoveSnippetAction,
    SaveSelectedNoteAction,
    SaveSelectedNoteCompleteAction,
    SaveSelectedNoteErrorAction,
} from './actions';
import { NoteEditorService } from './editor/editor.service';
import { NoteStateForFeature, NoteStateWithRoot } from './reducers';
import { NoteFsService } from './shared/note-fs.service';
import { NoteSelectionService } from './shared/note-selection.service';


@Injectable()
export class NoteFsEffects {
    @Effect()
    getCollection: Observable<Action> = this.actions.pipe(
        ofType(NoteActionTypes.GET_NOTE_COLLECTION),
        switchMap(() => this.noteFsService.readNoteMetadataCollection()),
        map(notes => new GetNoteCollectionCompleteAction({ notes })),
    );

    @Effect()
    loadContent: Observable<Action> = this.actions.pipe(
        ofType(NoteActionTypes.LOAD_NOTE_CONTENT),
        switchMap((action: LoadNoteContentAction) =>
            this.noteFsService.readNoteContent(action.payload.note.noteFileName)),
        map(content => new LoadNoteContentCompleteAction({ content })),
    );

    @Effect()
    addNote: Observable<Action> = this.actions.pipe(
        ofType<AddNoteAction>(NoteActionTypes.ADD_NOTE),
        switchMap((action: AddNoteAction) =>
            this.noteFsService
                .createNote(action.payload.metadata, action.payload.content)
                .pipe(
                    map(() => new AddNoteCompleteAction({
                        note: action.payload.metadata,
                    })),
                    catchError(error => of(new AddNoteErrorAction(error))),
                ),
        ),
    );

    @Effect({ dispatch: false })
    afterAddNote: Observable<Action> = this.actions.pipe(
        ofType<AddNoteCompleteAction>(NoteActionTypes.ADD_NOTE_COMPLETE),
        tap((action: AddNoteCompleteAction) =>
            this.noteSelectionService.selectNote(action.payload.note)),
    );

    @Effect()
    saveSelectedNote: Observable<Action> = this.actions.pipe(
        ofType<SaveSelectedNoteAction>(NoteActionTypes.SAVE_NOTE),
        mergeMap(() =>
            this.store.pipe(select(state => state.note))),
        filter(noteState =>
            !!noteState.collection.selectedNote
            && !!noteState.editor.selectedNoteContent,
        ),
        switchMap((noteState: NoteStateForFeature) =>
            zip(
                this.noteFsService.writeNoteMetadata(noteState.collection.selectedNote),
                this.noteFsService.writeNoteContent(noteState.editor.selectedNoteContent),
            ).pipe(
                catchError(error => of(new SaveSelectedNoteErrorAction(error))),
            ),
        ),
        map(() => new SaveSelectedNoteCompleteAction()),
    );

    constructor(
        private readonly actions: Actions,
        private store: Store<NoteStateWithRoot>,
        private noteFsService: NoteFsService,
        private noteSelectionService: NoteSelectionService,
    ) {}
}


@Injectable()
export class NoteEditorEffects {
    @Effect()
    afterLoadContent: Observable<Action> = this.actions.pipe(
        ofType(NoteActionTypes.LOAD_NOTE_CONTENT_COMPLETE),
        map((action: LoadNoteContentCompleteAction) =>
            new InitEditorAction({ content: action.payload.content })),
    );

    @Effect({ dispatch: false })
    initEditor: Observable<Action> = this.actions.pipe(
        ofType<InitEditorAction>(NoteActionTypes.INIT_EDITOR),
        tap((action: InitEditorAction) =>
            this.editorService.initFromNoteContent(action.payload.content)),
    );

    @Effect({ dispatch: false })
    disposeEditor: Observable<Action> = this.actions.pipe(
        ofType(NoteActionTypes.DESELECT_NOTE),
        tap(() => this.editorService.dispose()),
    );

    @Effect({ dispatch: false })
    moveFocus: Observable<Action> = this.actions.pipe(
        ofType(
            NoteActionTypes.MOVE_FOCUS_TO_PREVIOUS_SNIPPET,
            NoteActionTypes.MOVE_FOCUS_TO_NEXT_SNIPPET,
        ),
        tap((action: NoteActions) => {
            switch (action.type) {
                case NoteActionTypes.MOVE_FOCUS_TO_PREVIOUS_SNIPPET:
                    this.editorService.moveFocus(action.payload.snippetId, -1);
                    break;

                case NoteActionTypes.MOVE_FOCUS_TO_NEXT_SNIPPET:
                    this.editorService.moveFocus(action.payload.snippetId, 1);
                    break;
            }
        }),
    );

    @Effect({ dispatch: false })
    removeSnippet: Observable<Action> = this.actions.pipe(
        ofType<RemoveSnippetAction>(NoteActionTypes.REMOVE_SNIPPET),
        tap((action: RemoveSnippetAction) =>
            this.editorService.removeSnippet(action.payload.snippetId)),
    );

    @Effect({ dispatch: false })
    insertSnippet: Observable<Action> = this.actions.pipe(
        ofType<InsertNewSnippetAction>(NoteActionTypes.INSERT_NEW_SNIPPET),
        tap((action: InsertNewSnippetAction) =>
            this.editorService.insertNewSnippetRef(
                action.payload.snippetId,
                action.payload.content,
            )),
    );

    @Effect()
    afterUpdate: Observable<Action> = this.actions.pipe(
        ofType(
            NoteActionTypes.REMOVE_SNIPPET,
            NoteActionTypes.INSERT_NEW_SNIPPET,
            NoteActionTypes.UPDATE_SNIPPET_CONTENT,
            NoteActionTypes.UPDATE_STACKS,
            NoteActionTypes.UPDATE_TITLE,
        ),
        debounceTime(300),
        map(() => new SaveSelectedNoteAction()),
    );

    constructor(
        private readonly actions: Actions,
        private editorService: NoteEditorService,
    ) {
    }
}


@Injectable()
export class NoteFinderEffects {
    @Effect({ dispatch: false })
    selectNoteAtMonth: Observable<Action> = this.actions.pipe(
        ofType(NoteActionTypes.CHANGE_DATE_FILTER),
        tap((action: ChangeDateFilterAction) => {
            if (!action.payload.ignoreSideEffect) {
                this.noteSelectionService.applyNoteSelectionByFilterChanges();
            }
        }),
    );

    constructor(
        private readonly actions: Actions,
        private store: Store<NoteStateWithRoot>,
        private noteSelectionService: NoteSelectionService,
    ) {
    }
}
