import { datetime } from '../../common/datetime';
import { createDummyList } from '../../testing/dummy';
import {
    AddNoteAction,
    ChangeDateFilterAction,
    ChangeEditorViewModeAction,
    GetNoteCollectionCompleteAction,
    InitEditorAction,
    InsertNewSnippetAction,
    RemoveSnippetAction,
    SelectNoteAction,
    UpdateSnippetContentAction,
    UpdateStacksAction,
    UpdateTitleAction,
} from './actions';
import {
    NoteContentDummyFactory,
    NoteContentSnippetDummyFactory,
    NoteMetadataDummyFactory,
} from './dummies';
import { NoteContent, NoteEditorViewModes, NoteFinderDateFilterTypes } from './models';
import {
    noteCollectionReducer,
    noteEditorReducer,
    NoteEditorState,
    noteFinderReducer,
} from './reducers';


describe('app.note.reducers.noteCollectionReducer', () => {
    describe('GET_NOTE_COLLECTION_COMPLETE', () => {
        it('should replace and add all notes', () => {
            const factory = new NoteMetadataDummyFactory();

            const prevNotes = createDummyList(factory, 5);
            const prevAction = new GetNoteCollectionCompleteAction({ notes: prevNotes });

            const nextNotes = createDummyList(factory, 3);
            const nextAction = new GetNoteCollectionCompleteAction({ notes: nextNotes });

            let state = noteCollectionReducer(undefined, prevAction);
            expect(state.notes).toEqual(prevNotes);

            state = noteCollectionReducer(state, nextAction);
            expect(state.notes).toEqual(nextNotes);
        });

        it('should loaded value to be true.', () => {
            const state = noteCollectionReducer(
                undefined,
                new GetNoteCollectionCompleteAction({ notes: [] }),
            );

            expect(state.loaded).toBe(true);
        });
    });

    describe('ADD_NOTE', () => {
        it('should add new note at collection.', () => {
            const beforeState = noteCollectionReducer(
                undefined,
                new GetNoteCollectionCompleteAction({ notes: [] }),
            );

            const note = new NoteMetadataDummyFactory().create();
            const content = new NoteContentDummyFactory().create(note.id);
            const action = new AddNoteAction({ metadata: note, content });

            const state = noteCollectionReducer(beforeState, action);

            expect(state.notes[0]).toEqual(note);
        });
    });

    describe('SELECT_NOTE', () => {
        it('should set selected note metadata.', () => {
            const selectedNote = new NoteMetadataDummyFactory().create();
            const state = noteCollectionReducer(
                undefined,
                new SelectNoteAction({ selectedNote }),
            );

            expect(state.selectedNote).toEqual(selectedNote);
        });
    });
});


describe('app.note.reducers.noteFinderReducer', () => {
    describe('CHANGE_DATE_FILTER', () => {
        it('should set date filters.', () => {
            const dateFilter = new Date();
            const dateFilterBy = NoteFinderDateFilterTypes.MONTH;

            const state = noteFinderReducer(
                undefined,
                new ChangeDateFilterAction({ dateFilter, dateFilterBy }),
            );

            expect(datetime.isSameDay(dateFilter, state.dateFilter)).toBe(true);
            expect(state.dateFilterBy).toEqual(NoteFinderDateFilterTypes.MONTH);
        });
    });
});


describe('app.note.reducers.noteEditorReducer', () => {
    describe('INIT_EDITOR', () => {
        it('should loaded value to be true.', () => {
            const content = new NoteContentDummyFactory().create();
            const action = new InitEditorAction({ content });

            const state = noteEditorReducer(undefined, action);

            expect(state.loaded).toBe(true);
        });

        it('should set selected note content from payload.', () => {
            const content = new NoteContentDummyFactory().create();
            const action = new InitEditorAction({ content });

            const state = noteEditorReducer(undefined, action);

            expect(state.selectedNoteContent).toEqual(content);
        });
    });

    describe('REMOVE_SNIPPET', () => {
        let content: NoteContent;
        let beforeState: NoteEditorState;

        beforeEach(() => {
            content = new NoteContentDummyFactory().create();
        });

        it('should not remove snippet, if number of snippets is 1.', () => {
            content.snippets.splice(1, content.snippets.length - 1);
            beforeState = noteEditorReducer(
                undefined,
                new InitEditorAction({ content }),
            );

            const snippetId = content.snippets[0].id;
            const action = new RemoveSnippetAction({ snippetId });

            const state = noteEditorReducer(beforeState, action);
            const indexOfTarget = state.selectedNoteContent.snippets.findIndex(
                snippet => snippet.id === snippetId);

            expect(indexOfTarget).not.toEqual(-1);
        });

        it('should remove snippet.', () => {
            beforeState = noteEditorReducer(
                undefined,
                new InitEditorAction({ content }),
            );

            const snippetId = content.snippets[1].id;
            const action = new RemoveSnippetAction({ snippetId });

            const state = noteEditorReducer(beforeState, action);
            const indexOfTarget = state.selectedNoteContent.snippets.findIndex(
                snippet => snippet.id === snippetId);

            expect(indexOfTarget).toEqual(-1);
        });
    });

    describe('INSERT_NEW_SNIPPET', () => {
        let content: NoteContent;
        let beforeState: NoteEditorState;

        beforeEach(() => {
            content = new NoteContentDummyFactory().create();
            beforeState = noteEditorReducer(
                undefined,
                new InitEditorAction({ content }),
            );
        });

        it('should insert new snippet.', () => {
            const snippetId = content.snippets[0].id;
            const newSnippetContent = new NoteContentSnippetDummyFactory().create();

            const action = new InsertNewSnippetAction({
                snippetId,
                content: newSnippetContent,
            });
            const state = noteEditorReducer(beforeState, action);

            expect(state.selectedNoteContent.snippets[1]).toEqual(newSnippetContent);
        });
    });

    describe('UPDATE_SNIPPET_CONTENT', () => {
        let content: NoteContent;
        let beforeState: NoteEditorState;

        beforeEach(() => {
            content = new NoteContentDummyFactory().create();
            beforeState = noteEditorReducer(
                undefined,
                new InitEditorAction({ content }),
            );
        });

        it('should update snippet.', () => {
            const snippetId = content.snippets[0].id;
            const patch = { value: 'new value' };

            const action = new UpdateSnippetContentAction({
                snippetId, patch,
            });
            const state = noteEditorReducer(beforeState, action);

            expect(state.selectedNoteContent.snippets[0])
                .toEqual({
                    ...content.snippets[0],
                    ...patch,
                });
        });
    });

    describe('UPDATE_STACKS', () => {
        let content: NoteContent;
        let beforeState: NoteEditorState;

        beforeEach(() => {
            content = new NoteContentDummyFactory().create();
            beforeState = noteEditorReducer(
                undefined,
                new InitEditorAction({ content }),
            );
        });

        it('should update stacks.', () => {
            const newStacks = ['stack1', 'stack2'];
            const action = new UpdateStacksAction({ stacks: newStacks });
            const state = noteEditorReducer(beforeState, action);

            expect(state.selectedNoteContent.stacks).toEqual(newStacks);
        });
    });

    describe('UPDATE_TITLE', () => {
        let content: NoteContent;
        let beforeState: NoteEditorState;

        beforeEach(() => {
            content = new NoteContentDummyFactory().create();
            beforeState = noteEditorReducer(
                undefined,
                new InitEditorAction({ content }),
            );
        });

        it('should update title.', () => {
            const newTitle = 'New Title';
            const action = new UpdateTitleAction({ title: newTitle });
            const state = noteEditorReducer(beforeState, action);

            expect(state.selectedNoteContent.title).toEqual(newTitle);
        });
    });

    describe('CHANGE_EDITOR_VIEW_MODE', () => {
        it('should change editor view mode.', () => {
            const action = new ChangeEditorViewModeAction({
                viewMode: NoteEditorViewModes.EDITOR_ONLY,
            });
            const state = noteEditorReducer(undefined, action);

            expect(state.viewMode).toEqual(NoteEditorViewModes.EDITOR_ONLY);
        });
    });
});
