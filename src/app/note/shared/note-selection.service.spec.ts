import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { datetime, DateUnits } from '../../../common/datetime';
import { createDummyList } from '../../../testing/dummy';
import { LoadUserDataCompleteAction, SaveUserDataAction } from '../../core/actions';
import { UserDataDummyFactory } from '../../core/dummies';
import { userDataReducer } from '../../core/reducers';
import {
    ChangeDateFilterAction,
    DeselectNoteAction,
    GetNoteCollectionCompleteAction,
    LoadNoteContentAction,
    SelectNoteAction,
} from '../actions';
import { NoteMetadataDummyFactory } from '../dummies';
import { NoteFinderDateFilterTypes, NoteMetadata } from '../models';
import { noteReducerMap, NoteStateWithRoot } from '../reducers';
import { NoteSelectionService } from './note-selection.service';


describe('NoteSelectionService', () => {
    let noteSelectionService: NoteSelectionService;
    let store: Store<NoteStateWithRoot>;

    beforeEach(() => {
        TestBed
            .configureTestingModule({
                imports: [
                    StoreModule.forRoot({
                        userData: userDataReducer,
                        note: combineReducers(noteReducerMap),
                    }),
                ],
                providers: [
                    NoteSelectionService,
                ],
            });
    });

    beforeEach(() => {
        noteSelectionService = TestBed.get(NoteSelectionService);
        store = TestBed.get(Store);

        spyOn(store, 'dispatch').and.callThrough();
    });

    describe('selectLastOpenedNote', () => {
        it('should select last opened note and load note content ' +
            'when last opened note is exists in user data.', fakeAsync(() => {

            // Initialize states.
            const notes = createDummyList(new NoteMetadataDummyFactory(), 10);
            const userData = new UserDataDummyFactory().create();
            const selectedNote = notes[4];

            userData.lastOpenedNote = { ...selectedNote };

            store.dispatch(new GetNoteCollectionCompleteAction({ notes }));
            store.dispatch(new LoadUserDataCompleteAction({ userData }));
            noteSelectionService.selectLastOpenedNote();
            flush();

            const selectNoteAction = (<jasmine.Spy>store.dispatch).calls.argsFor(2);
            const loadNoteContentAction = (<jasmine.Spy>store.dispatch).calls.argsFor(3);

            expect(selectNoteAction).toEqual([new SelectNoteAction({ selectedNote })]);
            expect(loadNoteContentAction).toEqual([new LoadNoteContentAction({
                note: selectedNote,
            })]);
        }));

        it('should not select note ' +
            'when last opened note is not exists in user data.', fakeAsync(() => {

            // Initialize states.
            const notes = createDummyList(new NoteMetadataDummyFactory(), 10);
            const userData = new UserDataDummyFactory().create();
            const selectedNote = notes[4];

            userData.lastOpenedNote = null;

            store.dispatch(new GetNoteCollectionCompleteAction({ notes }));
            store.dispatch(new LoadUserDataCompleteAction({ userData }));
            noteSelectionService.selectLastOpenedNote();
            flush();

            expect(store.dispatch).not.toHaveBeenCalledWith(new LoadNoteContentAction({
                note: selectedNote,
            }));
        }));
    });

    describe('toggleNoteSelection', () => {
        let notes: NoteMetadata[];

        beforeEach(fakeAsync(() => {
            notes = createDummyList(new NoteMetadataDummyFactory(), 10);
            store.dispatch(new GetNoteCollectionCompleteAction({ notes }));
            flush();
        }));

        it('should select note when current selected note is ' +
            'note same with target note.', fakeAsync(() => {

            const currentSelectedNote = notes[3];
            const targetNote = notes[5];

            spyOn(noteSelectionService, 'selectNote');

            store.dispatch(new SelectNoteAction({ selectedNote: currentSelectedNote }));
            noteSelectionService.toggleNoteSelection(targetNote);
            flush();

            expect(noteSelectionService.selectNote).toHaveBeenCalledWith(targetNote);
        }));

        it('should select note when current selected note is not exists.', fakeAsync(() => {
            const targetNote = notes[5];

            spyOn(noteSelectionService, 'selectNote');

            noteSelectionService.toggleNoteSelection(targetNote);
            flush();

            expect(noteSelectionService.selectNote).toHaveBeenCalledWith(targetNote);
        }));

        it('should deselect note when current selected note is ' +
            'same with target note.', fakeAsync(() => {

            const currentSelectedNote = notes[3];
            const targetNote = notes[3];

            spyOn(noteSelectionService, 'deselectNote');

            store.dispatch(new SelectNoteAction({ selectedNote: currentSelectedNote }));
            noteSelectionService.toggleNoteSelection(targetNote);
            flush();

            expect(noteSelectionService.deselectNote).toHaveBeenCalled();
        }));
    });

    describe('selectNote', () => {
        it('should dispatch \'SELECT_NOTE\', \'LOAD_NOTE_CONTENT\', \'SAVE_USER_DATA\' ' +
            'actions.', () => {

            const selectedNote = new NoteMetadataDummyFactory().create();

            const selectNoteAction = new SelectNoteAction({ selectedNote });
            const loadNoteContentAction = new LoadNoteContentAction({ note: selectedNote });
            const saveUserDataAction = new SaveUserDataAction({
                userData: { lastOpenedNote: selectedNote },
            });

            noteSelectionService.selectNote(selectedNote);

            const dispatchSpy = <jasmine.Spy>store.dispatch;

            expect(dispatchSpy.calls.argsFor(0)).toEqual([selectNoteAction]);
            expect(dispatchSpy.calls.argsFor(1)).toEqual([loadNoteContentAction]);
            expect(dispatchSpy.calls.argsFor(2)).toEqual([saveUserDataAction]);
        });
    });

    describe('deselectNote', () => {
        it('should dispatch \'DESELECT_NOTE\', \'SAVE_USER_DATA\' actions.', () => {
            const deselectNoteAction = new DeselectNoteAction();
            const saveUserDataAction = new SaveUserDataAction({
                userData: { lastOpenedNote: null },
            });

            noteSelectionService.deselectNote();

            const dispatchSpy = <jasmine.Spy>store.dispatch;

            expect(dispatchSpy.calls.argsFor(0)).toEqual([deselectNoteAction]);
            expect(dispatchSpy.calls.argsFor(1)).toEqual([saveUserDataAction]);
        });
    });

    describe('applyNoteSelectionByFilterChanges', () => {
        it('should deselect note when filtered notes are empty ' +
            'and current selected note is exists.', fakeAsync(() => {

            // Initialize states.
            const notes = createDummyList(new NoteMetadataDummyFactory(), 10);
            store.dispatch(new GetNoteCollectionCompleteAction({ notes }));
            store.dispatch(new SelectNoteAction({ selectedNote: notes[4] }));
            flush();

            spyOn(noteSelectionService, 'deselectNote');

            // Apply date filter changes.
            const indexDate = new Date();
            datetime.add(indexDate, DateUnits.MONTH, -1);

            const action = new ChangeDateFilterAction({
                dateFilter: datetime.copy(indexDate),
                dateFilterBy: NoteFinderDateFilterTypes.MONTH,
            });

            store.dispatch(action);
            flush();

            noteSelectionService.applyNoteSelectionByFilterChanges();
            flush();

            expect(noteSelectionService.deselectNote).toHaveBeenCalled();
        }));

        it('should select first note of filtered notes, ' +
            'when filtered notes are not empty.', fakeAsync(() => {

            // Initialize states.
            const notes = createDummyList(new NoteMetadataDummyFactory(), 10);
            store.dispatch(new GetNoteCollectionCompleteAction({ notes }));
            flush();

            spyOn(noteSelectionService, 'selectNote');

            // Apply date filter changes.
            const indexDate = new Date();
            const action = new ChangeDateFilterAction({
                dateFilter: datetime.copy(indexDate),
                dateFilterBy: NoteFinderDateFilterTypes.MONTH,
            });

            store.dispatch(action);
            flush();

            noteSelectionService.applyNoteSelectionByFilterChanges();
            flush();

            expect(noteSelectionService.selectNote).toHaveBeenCalledWith(notes[0]);
        }));
    });
});
