import { datetime } from '../../common/datetime';
import { createDummyList } from '../../testing/dummy';
import {
    ChangeDateFilterAction,
    GetNoteCollectionCompleteAction, InitEditorAction, RemoveSnippetAction,
    SelectNoteAction, UpdateSnippetContentAction, UpdateStacksAction,
} from './actions';
import { NoteContentDummyFactory, NoteMetadataDummyFactory } from './dummies';
import { NoteContent, NoteFinderDateFilterTypes } from './models';
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
});