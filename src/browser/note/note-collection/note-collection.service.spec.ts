import { DatePipe } from '@angular/common';
import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { shell } from 'electron';
import * as path from 'path';
import { of, Subject } from 'rxjs';
import { createDummies, fastTestSetup } from '../../../../test/helpers';
import { FsMatchLiterals, FsMatchObject, FsStub, MockFsService } from '../../../../test/mocks/browser';
import { makeNoteContentFileName, Note } from '../../../core/note';
import { VcsFileChange } from '../../../core/vcs';
import { FsService, WORKSPACE_DEFAULT_CONFIG, WorkspaceConfig, WorkspaceService } from '../../shared';
import { VcsFileChangeDummy } from '../../vcs/dummies';
import {
    NoteContentFileAlreadyExistsError,
    NoteError,
    NoteErrorCodes,
    NoteOutsideWorkspaceError,
} from '../note-errors';
import { NoteParser } from '../note-shared';
import { noteReducerMap } from '../note.reducer';
import { NoteStateWithRoot } from '../note.state';
import { NoteDummy, NoteItemDummy } from './dummies';
import {
    AddNoteAction,
    ChangeNoteStacksAction,
    ChangeNoteTitleAction,
    DeleteNoteAction,
    DeselectNoteAction,
    LoadNoteCollectionAction,
    LoadNoteCollectionCompleteAction,
    SelectNoteAction,
} from './note-collection.actions';
import { NoteCollectionService } from './note-collection.service';


describe('browser.note.noteCollection.NoteCollectionService', () => {
    let collection: NoteCollectionService;
    let parser: NoteParser;

    let mockFs: MockFsService;
    let store: Store<NoteStateWithRoot>;

    const workspaceConfig: WorkspaceConfig = {
        rootDirPath: '/test/workspace/',
        geeksDiaryDirPath: '/test/workspace/.geeks-diary/',
        notesDirPath: '/test/workspace/.geeks-diary/notes/',
    };

    const noteDummy = new NoteDummy();
    const noteItemDummy = new NoteItemDummy(
        workspaceConfig.rootDirPath,
        workspaceConfig.notesDirPath,
    );
    const vcsFileChangeDummy = new VcsFileChangeDummy();

    fastTestSetup();

    beforeAll(() => {
        TestBed
            .configureTestingModule({
                imports: [
                    StoreModule.forRoot({
                        note: combineReducers(noteReducerMap),
                    }),
                ],
                providers: [
                    DatePipe,
                    ...MockFsService.providers(),
                    { provide: WORKSPACE_DEFAULT_CONFIG, useValue: workspaceConfig },
                    WorkspaceService,
                    NoteParser,
                    NoteCollectionService,
                ],
            });
    });

    beforeEach(() => {
        collection = TestBed.get(NoteCollectionService);
        parser = TestBed.get(NoteParser);
        mockFs = TestBed.get(FsService);
        store = TestBed.get(Store);
    });

    afterEach(() => {
        mockFs.verify();
    });

    describe('load', () => {
        it('should flow in the following order:' +
            '1) Dispatch \'LOAD_COLLECTION\' action. ' +
            '2) Get all notes. ' +
            '3) Change note to note item. ' +
            '4) Dispatch \'LOAD_COLLECTION_COMPLETE\' action.', fakeAsync(() => {

            const notes = createDummies(noteDummy, 10);
            const noteItems = notes.map(note => noteItemDummy.createFromNote(note));

            spyOn(store, 'dispatch');

            // Call method.
            const callback = jasmine.createSpy('callback');
            collection.loadOnce().then(callback);

            // 1) Dispatch 'LOAD_COLLECTION' action.
            expect(store.dispatch).toHaveBeenCalledWith(
                new LoadNoteCollectionAction(),
            );

            // 2) Get all notes.
            const notesFileNames = noteItems.map(item => item.fileName);

            mockFs
                .expect<string[]>({
                    methodName: 'readDirectory',
                    args: [workspaceConfig.notesDirPath],
                })
                .flush(notesFileNames);

            // 3) Change notes to note items.
            const matchObjList: FsMatchObject[] = noteItems.map(item => ({
                methodName: 'readJsonFile',
                args: [item.filePath],
            }));

            mockFs.expectMany<Note>(matchObjList).forEach((stub, index) => {
                (stub as FsStub<Note>).flush(notes[index]);
            });

            // 4) Dispatch 'LOAD_COLLECTION_COMPLETE' action.
            expect(store.dispatch).toHaveBeenCalledWith(
                new LoadNoteCollectionCompleteAction({ notes: noteItems }),
            );
        }));
    });

    describe('toggleNoteSelection', () => {
        beforeEach(() => {
            spyOn(collection, 'selectNote');
            spyOn(collection, 'deselectNote');
        });

        it('should deselect note if selected note is exists and ' +
            'same with input note.', fakeAsync(() => {
            const note = noteItemDummy.create();

            spyOn(collection, 'getSelectedNote').and.returnValue(of(note));

            collection.toggleNoteSelection(note);
            flush();

            expect(collection.deselectNote).toHaveBeenCalled();
        }));

        it('should select note if selected note is note exists.', fakeAsync(() => {
            const note = noteItemDummy.create();

            spyOn(collection, 'getSelectedNote').and.returnValue(of(null));

            collection.toggleNoteSelection(note);
            flush();

            expect(collection.selectNote).toHaveBeenCalledWith(note);
        }));

        it('should select note if selected note is exists and ' +
            'not same with input note.', fakeAsync(() => {
            const selectedNote = noteItemDummy.create();
            const note = noteItemDummy.create();

            spyOn(collection, 'getSelectedNote').and.returnValue(of(selectedNote));

            collection.toggleNoteSelection(note);
            flush();

            expect(collection.selectNote).toHaveBeenCalledWith(note);
        }));
    });

    describe('selectNote', () => {
        beforeEach(() => {
            spyOn(store, 'dispatch');
        });

        it('should dispatch \'SELECT_NOTE\' action.', () => {
            const note = noteItemDummy.create();

            collection.selectNote(note);

            expect(store.dispatch).toHaveBeenCalledWith(new SelectNoteAction({ note }));
        });
    });

    describe('deselectNote', () => {
        beforeEach(() => {
            spyOn(store, 'dispatch');
        });

        it('should dispatch \'DESELECT_NOTE\' action.', () => {
            collection.deselectNote();

            expect(store.dispatch).toHaveBeenCalledWith(new DeselectNoteAction());
        });
    });

    describe('createNewNote', () => {
        const title = 'This is note';
        const contentFileName = makeNoteContentFileName(new Date().getTime(), title);

        const getContentFilePath = (label?: string): string => {
            if (label) {
                return path.resolve(workspaceConfig.rootDirPath, label, contentFileName);
            }

            return path.resolve(workspaceConfig.rootDirPath, contentFileName);
        };

        it('should throw \'CONTENT_FILE_ALREADY_EXISTS\' error if content file already exists.', fakeAsync(() => {
            const label = 'javascript/angular';
            const filePath = getContentFilePath(label);

            const callback = jasmine.createSpy('create new note spy');

            collection
                .createNewNote(title, label)
                .then(() => {
                })
                .catch(callback);

            mockFs
                .expect<boolean>({
                    methodName: 'isPathExists',
                    args: [filePath],
                })
                .flush(true);

            const expected = new NoteContentFileAlreadyExistsError();
            expect(callback).toHaveBeenCalledWith(expected);
        }));

        it('should throw \'OUTSIDE_WORKSPACE\' error if save file path is outside of workspace.', fakeAsync(() => {
            const label = '../../outside';
            const callback = jasmine.createSpy('create new note spy');

            collection.createNewNote(title, label).catch(callback);

            flush();

            const expected = new NoteOutsideWorkspaceError();
            expect(callback).toHaveBeenCalledWith(expected);
        }));

        it('should dispatch \'ADD_NOTE\' and \'SELECT_NOTE\' actions after '
            + 'create new note.', fakeAsync(() => {
            spyOn(store, 'dispatch');

            const filePath = getContentFilePath();

            const callback = jasmine.createSpy('create new note spy');
            collection.createNewNote(title).then(callback);

            // Pass content file path exists.
            mockFs
                .expect<boolean>({
                    methodName: 'isPathExists',
                    args: [filePath],
                })
                .flush(false);

            // Ensure directory
            const baseDir = path.dirname(filePath);
            mockFs
                .expect<void>({
                    methodName: 'ensureDirectory',
                    args: [baseDir],
                })
                .flush();

            // First, create note.
            const stub = mockFs
                .expect<void>({
                    methodName: 'writeJsonFile',
                    args: [FsMatchLiterals.ANY, FsMatchLiterals.ANY],
                });

            const noteSaveData = stub.matchObj.args[1] as Note;

            expect(noteSaveData.id).toBeDefined();
            expect(noteSaveData.title).toEqual(title);
            expect(noteSaveData.stackIds).toEqual([]);
            expect(noteSaveData.createdDatetime).toBeDefined();

            stub.flush();

            // Second, create content file.
            mockFs
                .expect<void>({
                    methodName: 'writeFile',
                    args: [filePath, FsMatchLiterals.ANY],
                })
                .flush();

            // Last, dispatch 'ADD_NOTE' action.
            const calls = (<jasmine.Spy>store.dispatch).calls.all();

            expect(calls[calls.length - 2].args[0] instanceof AddNoteAction).toBe(true);
            expect(calls[calls.length - 1].args[0] instanceof SelectNoteAction).toBe(true);
        }));
    });

    describe('changeNoteTitle', () => {
        it('should throw \'CONTENT_FILE_ALREADY_EXISTS\' error if content file already '
            + 'exists with new title.', fakeAsync(() => {
            const note = noteItemDummy.create();
            const newTitle = 'already-exists';
            const newContentFilePath = path.resolve(
                path.dirname(note.contentFilePath),
                makeNoteContentFileName(note.createdDatetime, newTitle),
            );

            let error = null;

            const callback = jasmine.createSpy('change note title spy');
            collection.changeNoteTitle(note, newTitle).then(callback).catch(err => error = err);
            flush();

            mockFs
                .expect<boolean>({
                    methodName: 'renameFile',
                    args: [
                        note.contentFilePath, // Old Path
                        newContentFilePath, // New Path
                    ],
                })
                .error(new Error());

            expect(error instanceof NoteContentFileAlreadyExistsError).toBe(true);
            expect((error as NoteError).code).toEqual(NoteErrorCodes.CONTENT_FILE_ALREADY_EXISTS);
        }));

        it('should save note file and rename content file. After fs jobs, dispatch '
            + '\'CHANGE_NOTE_TITLE\' action.', fakeAsync(() => {
            spyOn(store, 'dispatch');

            const note = noteItemDummy.create();
            const newTitle = '안녕하세요';

            const newContentFileName = makeNoteContentFileName(note.createdDatetime, newTitle);
            const newContentFilePath = path.resolve(
                path.dirname(note.contentFilePath),
                newContentFileName,
            );

            const callback = jasmine.createSpy('change note title spy');
            collection.changeNoteTitle(note, newTitle).then(callback);
            flush();

            mockFs
                .expect<void>({
                    methodName: 'renameFile',
                    args: [
                        note.contentFilePath, // Old Path
                        newContentFilePath, // New Path
                    ],
                })
                .flush();

            expect(store.dispatch).toHaveBeenCalledWith(new ChangeNoteTitleAction({
                note,
                title: newTitle,
                contentFileName: newContentFileName,
                contentFilePath: newContentFilePath,
            }));
        }));
    });

    describe('changeNoteStacks', () => {
        it('should dispatch \"CHANGE_NOTE_STACKS\' action.', () => {
            spyOn(store, 'dispatch');

            const note = noteItemDummy.create();
            const stacks = ['a', 'b', 'c'];

            collection.changeNoteStacks(note, stacks);

            expect(store.dispatch).toHaveBeenCalledWith(new ChangeNoteStacksAction({
                note,
                stacks,
            }));
        });
    });

    describe('getNoteVcsFileChangeStatus', () => {
        it('should return status of note.', () => {
            const vcsFileChanges = new Subject<VcsFileChange[]>();
            collection.provideVcsFileChanges(vcsFileChanges.asObservable());

            const note = noteItemDummy.create();
            const fileChange = {
                ...vcsFileChangeDummy.create(),
                filePath: note.contentFileName,
                absoluteFilePath: note.contentFilePath,
            } as VcsFileChange;

            vcsFileChanges.next([fileChange]);

            expect(collection.getNoteVcsFileChangeStatus(note)).toEqual(fileChange.status);
        });
    });

    describe('deleteNote', () => {
        it('should dispatch \'DELETE_NOTE\' action if all note files removed.', () => {
            spyOn(store, 'dispatch');
            spyOn(shell, 'moveItemToTrash').and.returnValue(true);

            const note = noteItemDummy.create();
            collection.deleteNote(note);

            expect(shell.moveItemToTrash).toHaveBeenCalledWith(note.filePath);
            expect(shell.moveItemToTrash).toHaveBeenCalledWith(note.contentFilePath);

            expect(store.dispatch).toHaveBeenCalledWith(new DeleteNoteAction({ note }));
        });

        it('should also dispatch \'DESELECT_NOTE\' action if delete target note is currently '
            + 'selected.', () => {
            const note = noteItemDummy.create();
            store.dispatch(new SelectNoteAction({ note }));

            spyOn(store, 'dispatch');
            spyOn(shell, 'moveItemToTrash').and.returnValue(true);

            collection.deleteNote(note);

            expect(store.dispatch).toHaveBeenCalledWith(new DeselectNoteAction());
            expect(store.dispatch).toHaveBeenCalledWith(new DeleteNoteAction({ note }));
        });
    });
});
