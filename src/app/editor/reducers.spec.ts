import { NoteContentDummyFactory, NoteSimpleDummyFactory } from '../note/dummies';
import { NoteContent, NoteSimple } from '../note/models';
import {
    ChangeEditorViewModeAction,
    EditorActionTypes,
    InitEditorAction,
    RemoveSnippetAction,
} from './actions';
import { EditorViewModes } from './models';
import { createInitialEditorState, editorReducer, EditorState } from './reducers';


describe('app.editor.reducers', () => {
    let note: NoteSimple;
    let content: NoteContent;

    beforeEach(() => {
        note = new NoteSimpleDummyFactory().create();
        content = new NoteContentDummyFactory().create(note.id);
    });

    describe('undefined action', () => {
        it('should return initial state.', () => {
            const state = editorReducer(undefined, {} as any);

            expect(state).toEqual(createInitialEditorState());
        });
    });

    describe('EditorActionTypes.INIT_EDITOR', () => {
        it('should add snippets.', () => {
            const action = new InitEditorAction({ note, content });
            const state = editorReducer(
                createInitialEditorState(),
                action,
            );

            expect(state.snippets).toEqual(content.snippets);
        });

        it('should set loaded to true.', () => {
            const action = new InitEditorAction({ note, content });
            const state = editorReducer(
                createInitialEditorState(),
                action,
            );

            expect(state.loaded).toEqual(true);
        });

        it('should set title.', () => {
            const action = new InitEditorAction({ note, content });
            const state = editorReducer(
                createInitialEditorState(),
                action,
            );

            expect(state.title).toEqual(note.title);
        });

        it('should set focused snippet to first snippet.', () => {
            const action = new InitEditorAction({ note, content });
            const state = editorReducer(
                createInitialEditorState(),
                action,
            );

            expect(state.focusedSnippetId).toEqual(state.snippets[0].id);
        });
    });

    describe('EditorActionTypes.REMOVE_SNIPPET', () => {
        let beforeState: EditorState;

        beforeEach(() => {
            const action = new InitEditorAction({ note, content });
            beforeState = editorReducer(createInitialEditorState(), action);
        });

        it('should remove snippet. If snippet is first one, ' +
            'set focused snippet id with new first snippet.', () => {

            const targetId = content.snippets[0].id;
            const newFocusedSnippetId = content.snippets[1].id;

            const action = new RemoveSnippetAction({ snippetId: targetId });

            const state = editorReducer(beforeState, action);
            const indexOfTarget = state.snippets.findIndex(snippet => snippet.id === targetId);

            expect(indexOfTarget).toEqual(-1);
            expect(state.focusedSnippetId).toEqual(newFocusedSnippetId);
        });

        it('should remove snippet. If snippet is not first one, ' +
            'set focused snippet id with previous snippet.', () => {

            const targetId = content.snippets[5].id;
            const newFocusedSnippetId = content.snippets[4].id;

            const action = new RemoveSnippetAction({ snippetId: targetId });

            const state = editorReducer(beforeState, action);
            const indexOfTarget = state.snippets.findIndex(snippet => snippet.id === targetId);

            expect(indexOfTarget).toEqual(-1);
            expect(state.focusedSnippetId).toEqual(newFocusedSnippetId);
        });
    });

    describe('EditorActionTypes.CHANGE_VIEW_MODE', () => {
        it('should initial view mode to be \'SHOW_BOTH\'', () => {
            const state = editorReducer(undefined, {} as any);

            expect(state.viewMode).toEqual(EditorViewModes.SHOW_BOTH);
        });

        it('should change view mode with payload.', () => {
            const action = new ChangeEditorViewModeAction({
                viewMode: EditorViewModes.PREVIEW_ONLY,
            });
            const state = editorReducer(undefined, action);

            expect(state.viewMode).toEqual(EditorViewModes.PREVIEW_ONLY);
        });
    });
});
