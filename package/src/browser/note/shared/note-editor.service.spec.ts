import { QueryList } from '@angular/core';
import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';
import { createDummies } from '../../../../test/helpers/dummies';
import { NoteSnippetTypes } from '../../../models/note-snippet';
import { NoteSnippetEditorDummy } from '../dummies';
import { NoteSnippetEditor } from '../note-snippet-editors/note-snippet-editor';
import {
    NoteSnippetEditorEvent,
    NoteSnippetEditorEventNames,
} from '../note-snippet-editors/note-snippet-editor-events';
import { NoteSnippetContent } from './note-content.model';
import {
    InsertSnippetAction,
    RemoveSnippetAction,
    SetActiveSnippetIndexAction,
    UpdateSnippetAction,
} from './note-editor.actions';
import { NoteEditorService } from './note-editor.service';
import { noteReducerMap } from './note.reducer';
import { NoteStateWithRoot } from './note.state';


describe('browser.note.NoteEditorService', () => {
    let editor: NoteEditorService;
    let queryList: QueryList<NoteSnippetEditor>;

    let store: Store<NoteStateWithRoot>;
    let changesStream: BehaviorSubject<NoteSnippetEditor[]>;

    beforeEach(() => {
        queryList = jasmine.createSpyObj('queryList', [
            'toArray',
        ]);

        changesStream = new BehaviorSubject<NoteSnippetEditor[]>([]);

        queryList = {
            ...queryList,
            changes: changesStream.asObservable(),
        } as any;

        (<jasmine.Spy>queryList.toArray)
            .and.callFake(() => changesStream.getValue());
    });

    beforeEach(() => {
        TestBed
            .configureTestingModule({
                imports: [
                    StoreModule.forRoot({
                        note: combineReducers(noteReducerMap),
                    }),
                ],
                providers: [
                    NoteEditorService,
                ],
            });
    });

    beforeEach(() => {
        editor = TestBed.get(NoteEditorService);
        store = TestBed.get(Store);

        spyOn(store, 'dispatch');
    });

    let notes: NoteSnippetEditor[];
    const dummy = new NoteSnippetEditorDummy();

    beforeEach(() => {
        notes = createDummies(dummy, 5);
        changesStream.next(notes);

        editor.initSnippetEditors(queryList);
    });

    describe('insertSnippetEditor', () => {
        beforeEach(() => {
            spyOn(editor, 'focusTo');
        });

        it('should dispatch \'INSERT_SNIPPET\' action with index and ' +
            'snippet content. After query list stable, focus new snippet editor.', fakeAsync(() => {
            const index = 3;
            const snippetEditor = dummy.create();

            editor.insertSnippetEditor(index, snippetEditor.content);

            expect(store.dispatch).toHaveBeenCalledWith(
                new InsertSnippetAction({
                    index,
                    snippet: snippetEditor.content,
                }),
            );

            notes.splice(index, 0, snippetEditor);
            flush();

            expect(editor.focusTo).toHaveBeenCalledWith(index + 1);
        }));
    });

    describe('removeSnippetEditor', () => {
        it('should not dispatch \'REMOVE_SNIPPET\' action if current ' +
            'index is 0.', () => {
            editor.removeSnippetEditor(0);

            expect(store.dispatch).not.toHaveBeenCalledWith(
                new RemoveSnippetAction({ index: 3 }),
            );
        });

        it('should dispatch \'REMOVE_SNIPPET\' action and move focus ' +
            'to previous snippet editor.', () => {
            spyOn(editor, 'moveFocusByDirection');

            editor.removeSnippetEditor(3);

            expect(store.dispatch).toHaveBeenCalledWith(
                new RemoveSnippetAction({ index: 3 }),
            );
            expect(editor.moveFocusByDirection).toHaveBeenCalledWith(3, -1);
        });
    });

    describe('moveFocusByDirection', () => {
        beforeEach(() => {
            spyOn(editor, 'focusTo');
        });

        it('should not call if index is 0 and direction is -1', () => {
            editor.moveFocusByDirection(0, -1);
            expect(editor.focusTo).not.toHaveBeenCalled();
        });

        it('should not call if index is last index of items and ' +
            'direction is 1.', () => {
            editor.moveFocusByDirection(notes.length - 1, 1);
            expect(editor.focusTo).not.toHaveBeenCalled();
        });

        it('should focus to previous index snippet editor and set ' +
            'position to bottom when direction is -1.', () => {
            editor.moveFocusByDirection(2, -1);
            expect(editor.focusTo).toHaveBeenCalledWith(1, 'bottom');
        });

        it('should focus to next index snippet editor and set ' +
            'position to top when direction is 1.', () => {
            editor.moveFocusByDirection(2, 1);
            expect(editor.focusTo).toHaveBeenCalledWith(3, 'top');
        });
    });

    describe('focusTo', () => {
        it('should call focus method', () => {
            const index = 3;

            editor.focusTo(index);

            expect(notes[index].focus).toHaveBeenCalled();
        });

        it('should call focus method and setting position.', () => {
            editor.focusTo(2, 'top');

            expect(notes[2].focus).toHaveBeenCalled();
            expect(notes[2].setPositionToTop).toHaveBeenCalled();

            editor.focusTo(3, 'bottom');

            expect(notes[3].focus).toHaveBeenCalled();
            expect(notes[3].setPositionToBottom).toHaveBeenCalled();
        });
    });

    describe('updateSnippetEditorContent', () => {

    });

    describe('handle snippet editor events', () => {
        describe('INSERT_NEW_SNIPPET_AFTER_THIS', () => {
            beforeEach(() => {
                spyOn(editor, 'insertSnippetEditor');
            });

            it('should call \'insertSnippetEditor\' method.', () => {
                const index = 2;

                notes[index].content = {
                    type: NoteSnippetTypes.TEXT,
                    value: 'some value',
                };

                const event = new NoteSnippetEditorEvent(
                    NoteSnippetEditorEventNames.INSERT_NEW_SNIPPET_AFTER_THIS,
                    notes[index],
                );

                notes[index].events.next(event);

                const [calledIndex, snippet] = (<jasmine.Spy>editor.insertSnippetEditor)
                    .calls.mostRecent().args;

                expect(calledIndex).toEqual(index);
                expect((<NoteSnippetContent>snippet).type)
                    .toEqual(NoteSnippetTypes.TEXT);
            });

            it('should call \'insertSnippetEditor\' method.', () => {
                const index = 3;

                notes[index].content = {
                    type: NoteSnippetTypes.CODE,
                    value: 'some value',
                    codeFileName: 'some-file.ts',
                    codeLanguageId: 'typescript',
                };

                const event = new NoteSnippetEditorEvent(
                    NoteSnippetEditorEventNames.INSERT_NEW_SNIPPET_AFTER_THIS,
                    notes[index],
                );

                notes[index].events.next(event);

                const [calledIndex, snippet] = (<jasmine.Spy>editor.insertSnippetEditor)
                    .calls.mostRecent().args;

                expect(calledIndex).toEqual(index);
                expect((<NoteSnippetContent>snippet).type)
                    .toEqual(NoteSnippetTypes.CODE);
                expect((<NoteSnippetContent>snippet).codeLanguageId)
                    .toEqual('typescript');
            });
        });

        describe('REMOVE_THIS', () => {
            beforeEach(() => {
                spyOn(editor, 'removeSnippetEditor');
            });

            it('should call \'removeSnippetEditor\' method.', () => {
                const index = 4;

                notes[index].events.next(new NoteSnippetEditorEvent(
                    NoteSnippetEditorEventNames.REMOVE_THIS,
                    notes[index],
                ));

                expect(editor.removeSnippetEditor).toHaveBeenCalledWith(index);
            });
        });

        describe('MOVE_FOCUS_TO_PREVIOUS', () => {
            beforeEach(() => {
                spyOn(editor, 'moveFocusByDirection');
            });

            it('should call \'moveFocusByDirection\' method.', () => {
                const index = 4;

                notes[index].events.next(new NoteSnippetEditorEvent(
                    NoteSnippetEditorEventNames.MOVE_FOCUS_TO_PREVIOUS,
                    notes[index],
                ));

                expect(editor.moveFocusByDirection)
                    .toHaveBeenCalledWith(index, -1);
            });
        });

        describe('MOVE_FOCUS_TO_NEXT', () => {
            beforeEach(() => {
                spyOn(editor, 'moveFocusByDirection');
            });

            it('should call \'moveFocusByDirection\' method.', () => {
                const index = 4;

                notes[index].events.next(new NoteSnippetEditorEvent(
                    NoteSnippetEditorEventNames.MOVE_FOCUS_TO_NEXT,
                    notes[index],
                ));

                expect(editor.moveFocusByDirection)
                    .toHaveBeenCalledWith(index, 1);
            });
        });

        describe('FOCUSED', () => {
            it('should dispatch \'SET_ACTIVE_SNIPPET_INDEX\' action.', () => {
                const index = 0;

                notes[index].events.next(new NoteSnippetEditorEvent(
                    NoteSnippetEditorEventNames.FOCUSED,
                    notes[index],
                ));

                expect(store.dispatch).toHaveBeenCalledWith(
                    new SetActiveSnippetIndexAction({ activeIndex: index }),
                );
            });
        });

        describe('VALUE_CHANGED', () => {
            it('', () => {
                const index = 3;
                const value = 'patched value';

                notes[index].content = {
                    ...notes[index].content,
                    value,
                };

                (<jasmine.Spy>notes[index].getRawValue).and.returnValue(value);

                notes[index].events.next(new NoteSnippetEditorEvent(
                    NoteSnippetEditorEventNames.VALUE_CHANGED,
                    notes[index],
                ));

                expect(store.dispatch).toHaveBeenCalledWith(new UpdateSnippetAction({
                    index,
                    patch: notes[index].content,
                }));
            });
        });
    });
});
