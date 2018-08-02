import { sampleWithout } from '../../../../test/helpers/sampling';
import { NoteContentDummy, NoteSnippetContentDummy } from '../dummies';
import { NoteContent } from './note-content.model';
import {
    ChangeEditorViewModeAction,
    InsertSnippetAction,
    LoadNoteContentAction,
    LoadNoteContentCompleteAction,
    RemoveSnippetAction,
    SetActiveSnippetIndexAction,
    UnsetActiveSnippetIndexAction,
} from './note-editor.actions';
import { noteEditorReducer } from './note-editor.reducer';
import { createNoteEditorInitialState, NoteEditorState, NoteEditorViewModes } from './note-editor.state';


describe('browser.note.noteEditorReducer', () => {
    const defaultState = createNoteEditorInitialState();

    describe('LOAD_NOTE_CONTENT', () => {
        it('should set loading to true', () => {
            const state = noteEditorReducer(
                undefined,
                new LoadNoteContentAction({ note: null }),
            );

            expect(state.loading).toBe(true);
        });
    });

    describe('LOAD_NOTE_CONTENT_COMPLETE', () => {
        it('should set selected content', () => {
            const content = new NoteContentDummy().create();
            const state = noteEditorReducer(
                undefined,
                new LoadNoteContentCompleteAction({ content }),
            );

            expect(state.selectedNoteContent).toEqual(content);
        });
    });

    describe('INSERT_SNIPPET', () => {
        let content: NoteContent;
        let beforeState: NoteEditorState;

        beforeEach(() => {
            content = new NoteContentDummy().create(10);
            beforeState = noteEditorReducer(
                defaultState,
                new LoadNoteContentCompleteAction({ content }),
            );
        });

        it('should insert snippet after index', () => {
            const snippet = new NoteSnippetContentDummy().create();
            const state = noteEditorReducer(
                beforeState,
                new InsertSnippetAction({ index: 3, snippet }),
            );

            expect(state.selectedNoteContent.snippets[4]).toEqual(snippet);
        });
    });

    describe('REMOVE_SNIPPET', () => {
        let content: NoteContent;
        let beforeState: NoteEditorState;

        beforeEach(() => {
            content = new NoteContentDummy().create(10);
            beforeState = noteEditorReducer(
                defaultState,
                new LoadNoteContentCompleteAction({ content }),
            );
        });

        it('should remove snippet at index', () => {
            const target = { ...beforeState.selectedNoteContent.snippets[3] };
            const state = noteEditorReducer(
                beforeState,
                new RemoveSnippetAction({ index: 3 }),
            );

            expect(state.selectedNoteContent.snippets[3]).not.toEqual(target);
        });
    });

    describe('SET_ACTIVE_SNIPPET_INDEX', () => {
        it('should set active snippet index', () => {
            const state = noteEditorReducer(
                undefined,
                new SetActiveSnippetIndexAction({ activeIndex: 5 }),
            );

            expect(state.activeSnippetIndex).toEqual(5);
        });
    });

    describe('SET_ACTIVE_SNIPPET_INDEX', () => {
        let beforeState: NoteEditorState;

        beforeEach(() => {
            beforeState = noteEditorReducer(
                undefined,
                new SetActiveSnippetIndexAction({ activeIndex: 5 }),
            );
        });

        it('should unset active snippet index', () => {
            const state = noteEditorReducer(
                beforeState,
                new UnsetActiveSnippetIndexAction(),
            );

            expect(state.activeSnippetIndex).toBeNull();
        });
    });

    describe('CHANGE_VIEW_MODE', () => {
        it('should set editor view mode', () => {
            const viewMode = sampleWithout<NoteEditorViewModes>(
                NoteEditorViewModes,
                [defaultState.viewMode],
            );

            const state = noteEditorReducer(
                defaultState,
                new ChangeEditorViewModeAction({ viewMode }),
            );

            expect(state.viewMode).toEqual(viewMode);
        });
    });
});
