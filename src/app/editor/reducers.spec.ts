import { NoteContentDummyFactory, NoteMetadataDummyFactory } from '../note/dummies';
import { NoteContent, NoteMetadata } from '../note/models';
import {
    ChangeEditorViewModeAction,
    EditorActionTypes,
    InitEditorWithNoteContentAction,
    RemoveSnippetAction,
} from './actions';
import { EditorViewModes } from './models';
import { createInitialEditorState, editorReducer, EditorState } from './reducers';


describe('app.editor.reducers', () => {
    let note: NoteMetadata;
    let content: NoteContent;

    beforeEach(() => {
        note = new NoteMetadataDummyFactory().create();
        content = new NoteContentDummyFactory().create(note.id);

        note.noteFileName = '/test/note.gd';
        note.fileName = '/test/note.gd/meta.json';

        content.noteFileName = '/test/note.gd';
        content.fileName = '/test/note.gd/content.json';
    });

    describe('undefined action', () => {
        it('should return initial state.', () => {
            const state = editorReducer(undefined, {} as any);

            expect(state).toEqual(createInitialEditorState());
        });
    });

    describe('EditorActionTypes.INIT_EDITOR', () => {
        it('should add snippets.', () => {
            const action = new InitEditorWithNoteContentAction({ content });
            const state = editorReducer(
                createInitialEditorState(),
                action,
            );

            expect(state.snippets).toEqual(content.snippets);
        });

        it('should set loaded to true.', () => {
            const action = new InitEditorWithNoteContentAction({ content });
            const state = editorReducer(
                createInitialEditorState(),
                action,
            );

            expect(state.loaded).toEqual(true);
        });

        it('should set title.', () => {
            const action = new InitEditorWithNoteContentAction({ content });
            const state = editorReducer(
                createInitialEditorState(),
                action,
            );

            expect(state.title).toEqual(note.title);
        });
    });

    describe('EditorActionTypes.REMOVE_SNIPPET', () => {
        let beforeState: EditorState;

        beforeEach(() => {
            const action = new InitEditorWithNoteContentAction({ content });
            beforeState = editorReducer(createInitialEditorState(), action);
        });

        it('should remove snippet, if the number of snippets is more than 1', () => {
            const targetId = content.snippets[0].id;
            const action = new RemoveSnippetAction({ snippetId: targetId });

            const state = editorReducer(beforeState, action);
            const indexOfTarget = state.snippets.findIndex(snippet => snippet.id === targetId);

            expect(indexOfTarget).toEqual(-1);
        });

        it('should note remove snippet, if the number of snippets is 1', () => {
            content.snippets.splice(1, content.snippets.length - 1);

            beforeState = editorReducer(undefined, new InitEditorWithNoteContentAction({
                content,
            }));

            const targetId = content.snippets[0].id;
            const action = new RemoveSnippetAction({ snippetId: targetId });

            const state = editorReducer(beforeState, action);
            const indexOfTarget = state.snippets.findIndex(snippet => snippet.id === targetId);

            expect(indexOfTarget).toEqual(0);
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
