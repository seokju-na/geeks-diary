import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import * as path from 'path';
import { of } from 'rxjs';
import { createDummies } from '../../../../test/helpers/dummies';
import { FsMatchLiterals, FsMatchObject, FsStub, MockFsService } from '../../../../test/mocks/browser/mock-fs.service';
import { makeContentFileName, Note } from '../../../models/note';
import { FsService } from '../../core/fs.service';
import { WORKSPACE_CONFIGS, WorkspaceConfigs, WorkspaceService } from '../../core/workspace.service';
import { NoteDummy, NoteItemDummy } from '../dummies';
import {
    AddNoteAction,
    DeselectNoteAction,
    LoadNoteCollectionAction,
    LoadNoteCollectionCompleteAction,
    SelectNoteAction,
} from './note-collection.actions';
import { NoteCollectionService } from './note-collection.service';
import { NoteError, NoteErrorCodes } from './note-errors';
import { NoteParser } from './note-parser';
import { noteReducerMap } from './note.reducer';
import { NoteStateWithRoot } from './note.state';


describe('browser.note.NoteCollectionService', () => {
    let collection: NoteCollectionService;
    let parser: NoteParser;

    let mockFs: MockFsService;
    let store: Store<NoteStateWithRoot>;

    const workspaceConfigs: WorkspaceConfigs = {
        rootDirPath: '/test/workspace/',
        geeksDiaryDirPath: '/test/workspace/.geeks-diary/',
        notesDirPath: '/test/workspace/.geeks-diary/notes/',
    };

    const noteDummy = new NoteDummy(workspaceConfigs.rootDirPath);
    const noteItemDummy = new NoteItemDummy(
        workspaceConfigs.rootDirPath,
        workspaceConfigs.notesDirPath,
    );

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot({
                    note: combineReducers(noteReducerMap),
                }),
            ],
            providers: [
                ...MockFsService.providersForTesting,
                { provide: WORKSPACE_CONFIGS, useValue: workspaceConfigs },
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
            collection.load().then(callback);

            // 1) Dispatch 'LOAD_COLLECTION' action.
            expect(store.dispatch).toHaveBeenCalledWith(
                new LoadNoteCollectionAction(),
            );

            // 2) Get all notes.
            const notesFileNames = noteItems.map(item => item.fileName);

            mockFs
                .expect<string[]>({
                    methodName: 'readDirectory',
                    args: [workspaceConfigs.notesDirPath],
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
            const note = new NoteItemDummy().create();

            spyOn(collection, 'getSelectedNote').and.returnValue(of(note));

            collection.toggleNoteSelection(note);
            flush();

            expect(collection.deselectNote).toHaveBeenCalled();
        }));

        it('should select note if selected note is note exists.', fakeAsync(() => {
            const note = new NoteItemDummy().create();

            spyOn(collection, 'getSelectedNote').and.returnValue(of(null));

            collection.toggleNoteSelection(note);
            flush();

            expect(collection.selectNote).toHaveBeenCalledWith(note);
        }));

        it('should select note if selected note is exists and ' +
            'not same with input note.', fakeAsync(() => {
            const dummy = new NoteItemDummy();
            const selectedNote = dummy.create();
            const note = dummy.create();

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
            const note = new NoteItemDummy().create();

            collection.selectNote(note);

            expect(store.dispatch).toHaveBeenCalledWith(new SelectNoteAction({
                note,
            }));
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
        const contentFileName = makeContentFileName(new Date().getTime(), title);

        const getContentFilePath = (label?: string): string => {
            if (label) {
                return path.resolve(workspaceConfigs.rootDirPath, label, contentFileName);
            }

            return path.resolve(workspaceConfigs.rootDirPath, contentFileName);
        };

        it('should throw \'CONTENT_FILE_EXISTS\' error if content ' +
            'file already exists.', fakeAsync(() => {
            const label = 'javascript/angular';
            const filePath = getContentFilePath(label);

            const callback = jasmine.createSpy('create new note spy');

            collection
                .createNewNote(title, label)
                .then(() => {})
                .catch(callback);

            mockFs
                .expect<boolean>({
                    methodName: 'isPathExists',
                    args: [filePath],
                })
                .flush(true);

            const expected = new NoteError(NoteErrorCodes.CONTENT_FILE_EXISTS);

            expect(callback).toHaveBeenCalledWith(expected);
        }));

        it('should throw \'OUTSIDE_WORKSPACE\' error if save file ' +
            'path is outside of workspace.', fakeAsync(() => {
            const label = '../../outside';
            const callback = jasmine.createSpy('create new note spy');

            collection.createNewNote(title, label).catch(callback);

            flush();

            const expected = new NoteError(NoteErrorCodes.OUTSIDE_WORKSPACE);

            expect(callback).toHaveBeenCalledWith(expected);
        }));

        it('should dispatch \'ADD_NOTE\' action after create new note.', fakeAsync(() => {
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
            expect(noteSaveData.updatedDatetime).toBeDefined();

            stub.flush();

            // Second, create content file.
            mockFs
                .expect<void>({
                    methodName: 'writeFile',
                    args: [filePath, FsMatchLiterals.ANY],
                })
                .flush();

            // Last, dispatch 'ADD_NOTE' action.
            const actual = (<jasmine.Spy>store.dispatch).calls.mostRecent().args[0];

            expect(actual instanceof AddNoteAction).toBe(true);
        }));
    });
});
