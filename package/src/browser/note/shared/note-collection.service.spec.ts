import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { of } from 'rxjs';
import { createDummies } from '../../../../test/helpers/dummies';
import { FsMatchObject, MockFsService } from '../../../../test/mocks/browser/mock-fs.service';
import { FsService } from '../../core/fs.service';
import { WORKSPACE_CONFIGS, WorkspaceConfigs, WorkspaceService } from '../../core/workspace.service';
import { NoteDummy, NoteItemDummy } from '../dummies';
import {
    DeselectNoteAction,
    LoadNoteCollectionAction,
    LoadNoteCollectionCompleteAction,
    SelectNoteAction,
} from './note-collection.actions';
import { NoteCollectionService } from './note-collection.service';
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
                .expect({
                    methodName: 'readDirectory',
                    args: [workspaceConfigs.notesDirPath],
                })
                .flush(notesFileNames);

            // 3) Change notes to note items.
            const matchObjList: FsMatchObject[] = noteItems.map(item => ({
                methodName: 'readFile',
                args: [item.filePath],
            }));

            mockFs.expectMany(matchObjList).forEach((stub, index) => {
                const data = JSON.stringify(notes[index]);
                stub.flush(Buffer.from(data));
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
});
