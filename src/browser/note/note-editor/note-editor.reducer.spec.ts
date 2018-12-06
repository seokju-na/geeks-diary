import { NoteItemDummy } from '../note-collection/dummies';
import { NoteContentDummy, NoteSnippetContentDummy } from './dummies';
import { NoteSnippetContent } from './note-content.model';
import {
    AppendSnippetAction,
    BlurSnippetAction,
    ChangeViewModeAction,
    FocusSnippetAction,
    InsertSnippetAction,
    LoadNoteContentAction,
    LoadNoteContentCompleteAction,
    RemoveSnippetAction,
    UpdateSnippetAction,
} from './note-editor.actions';
import { noteEditorReducer } from './note-editor.reducer';
import { createNoteEditorInitialState, NoteEditorState, NoteEditorViewModes } from './note-editor.state';


describe('browser.note.noteEditor.noteEditorReducer', () => {
    const defaultState = createNoteEditorInitialState();

    const noteItemDummy = new NoteItemDummy();
    const noteContentDummy = new NoteContentDummy();

    function ensureNoteContentLoaded(snippetsCount: number = 5): NoteEditorState {
        const note = noteItemDummy.create();
        const content = noteContentDummy.create(snippetsCount);

        return noteEditorReducer(
            defaultState,
            new LoadNoteContentCompleteAction({ note, content }),
        );
    }

    describe('LOAD_NOTE_CONTENT', () => {
        it('should set loading to true', () => {
            const state = noteEditorReducer(
                undefined,
                new LoadNoteContentAction({ note: new NoteItemDummy().create() }),
            );

            expect(state.loaded).toBe(false);
            expect(state.loading).toBe(true);
        });
    });

    describe('LOAD_NOTE_CONTENT_COMPLETE', () => {
        it('should set selected content', () => {
            const content = new NoteContentDummy().create();
            const state = noteEditorReducer(
                undefined,
                new LoadNoteContentCompleteAction({ note: new NoteItemDummy().create(), content }),
            );

            expect(state.loaded).toBe(true);
            expect(state.selectedNoteContent).toEqual(content);
        });
    });

    describe('INSERT_SNIPPET', () => {
        let beforeState: NoteEditorState;

        beforeEach(() => {
            beforeState = ensureNoteContentLoaded(5);
        });

        it('should insert snippet at index', () => {
            const snippet = new NoteSnippetContentDummy().create();
            const state = noteEditorReducer(
                beforeState,
                new InsertSnippetAction({ index: 3, snippet }),
            );

            expect(state.selectedNoteContent.snippets[3]).toEqual(snippet);
        });
    });

    describe('REMOVE_SNIPPET', () => {
        let beforeState: NoteEditorState;

        beforeEach(() => {
            beforeState = ensureNoteContentLoaded(5);
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

    describe('APPEND_SNIPPET', () => {
        let beforeState: NoteEditorState;

        beforeEach(() => {
            beforeState = ensureNoteContentLoaded(5);
        });

        it('should append snippet.', () => {
            const newSnippet = new NoteSnippetContentDummy().create();
            const state = noteEditorReducer(
                beforeState,
                new AppendSnippetAction({ snippet: newSnippet }),
            );

            expect(
                state.selectedNoteContent.snippets[state.selectedNoteContent.snippets.length - 1],
            ).toEqual(newSnippet);
        });
    });

    describe('UPDATE_SNIPPET', () => {
        let beforeState: NoteEditorState;

        beforeEach(() => {
            beforeState = ensureNoteContentLoaded(5);
        });

        it('should update snippet at index.', () => {
            const patch: Partial<NoteSnippetContent> = {
                value: 'new value',
            };

            const state = noteEditorReducer(
                beforeState,
                new UpdateSnippetAction({ index: 3, patch }),
            );

            expect(state.selectedNoteContent.snippets[3].value).toEqual('new value');
        });
    });

    describe('FOCUS_SNIPPET', () => {
        let beforeState: NoteEditorState;

        beforeEach(() => {
            beforeState = ensureNoteContentLoaded(5);
        });

        it('should set active snippet index as focused snippet index.', () => {
            const state = noteEditorReducer(beforeState, new FocusSnippetAction({ index: 2 }));
            expect(state.activeSnippetIndex).toEqual(2);
        });
    });

    describe('BLUR_SNIPPET', () => {
        let beforeState: NoteEditorState;

        beforeEach(() => {
            beforeState = ensureNoteContentLoaded(5);
            beforeState = noteEditorReducer(beforeState, new FocusSnippetAction({ index: 0 }));
        });

        it('should set active snippet index as null.', () => {
            const state = noteEditorReducer(beforeState, new BlurSnippetAction());
            expect(state.activeSnippetIndex).toBeNull();
        });
    });

    describe('CHANGE_VIEW_MODE', () => {
        it('should set editor view mode.', () => {
            const state = noteEditorReducer(undefined, new ChangeViewModeAction({
                viewMode: NoteEditorViewModes.EDITOR_ONLY,
            }));

            expect(state.viewMode).toEqual(NoteEditorViewModes.EDITOR_ONLY);
        });
    });
});
