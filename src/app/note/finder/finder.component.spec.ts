import { DatePipe } from '@angular/common';
import { DebugElement } from '@angular/core';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { datetime, DateUnits } from '../../../common/datetime';
import { createDummyList } from '../../../testing/dummy';
import { MockFsService } from '../../../testing/mock';
import { MonacoService } from '../../core/monaco.service';
import { SharedModule } from '../../shared/shared.module';
import { StackModule } from '../../stack/stack.module';
import {
    GetNoteCollectionAction,
    GetNoteCollectionCompleteAction,
    SelectNoteAction,
} from '../actions';
import { NoteCalendarComponent } from '../calendar/calendar.component';
import { NoteMetadataDummyFactory } from '../dummies';
import { NoteItemComponent } from '../item/item.component';
import { NoteMetadata } from '../models';
import { NoteFsService } from '../note-fs.service';
import { noteReducerMap, NoteStateWithRoot } from '../reducers';
import { NoteFinderComponent } from './finder.component';


describe('app.note.finder.NoteFinderComponent', () => {
    let fixture: ComponentFixture<NoteFinderComponent>;
    let component: NoteFinderComponent;

    let store: Store<NoteStateWithRoot>;
    let datePipe: DatePipe;

    const validateNoteItem = (noteItemEl: DebugElement, note: NoteMetadata): void => {
        const instance: NoteItemComponent = noteItemEl.componentInstance;

        expect(instance.note).toEqual(note);
    };

    beforeEach(async(() => {
        TestBed
            .configureTestingModule({
                imports: [
                    SharedModule,
                    StackModule,
                    StoreModule.forRoot({
                        note: combineReducers(noteReducerMap),
                    }),
                ],
                providers: [
                    DatePipe,
                    ...MockFsService.providersForTesting,
                    MonacoService,
                    NoteFsService,
                ],
                declarations: [
                    NoteCalendarComponent,
                    NoteItemComponent,
                    NoteFinderComponent,
                ],
            })
            .compileComponents();
    }));

    beforeEach(inject(
        [Store, DatePipe],
        (s: Store<NoteStateWithRoot>, d: DatePipe) => {
            store = s;
            datePipe = d;
        },
    ));

    beforeEach(() => {
        spyOn(store, 'dispatch').and.callThrough();

        fixture = TestBed.createComponent(NoteFinderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should dispatch \'GET_NOTE_COLLECTION\' action on init', () => {
        expect(store.dispatch).toHaveBeenCalledWith(new GetNoteCollectionAction());
    });

    it('should display notes as the month in which the creation date is ' +
        'currently being viewed, if the finder filter type is \'MONTH\'.', () => {

        const notes = createDummyList(new NoteMetadataDummyFactory(), 5);
        const nextMonth = datetime.today();

        datetime.add(nextMonth, DateUnits.MONTH, 1);

        notes[0] = NoteMetadata.applyPatch(notes[0], {
            createdDatetime: nextMonth.getTime(),
        });

        notes[1] = NoteMetadata.applyPatch(notes[0], {
            createdDatetime: nextMonth.getTime(),
        });

        store.dispatch(new GetNoteCollectionCompleteAction({ notes }));
        fixture.detectChanges();

        const noteItemElList = fixture.debugElement.queryAll(By.directive(NoteItemComponent));

        expect(noteItemElList.length).toEqual(3);

        validateNoteItem(noteItemElList[0], notes[2]);
        validateNoteItem(noteItemElList[1], notes[3]);
        validateNoteItem(noteItemElList[2], notes[4]);
    });

    it('should display notes as the date in which the creation date is ' +
        'same with selected date, if the finder filter type is \'DATE\'.', () => {

        const notes = createDummyList(new NoteMetadataDummyFactory(), 5);
        const nextDay = datetime.today();

        datetime.add(nextDay, DateUnits.DAY, 1);

        notes[0] = NoteMetadata.applyPatch(notes[0], {
            createdDatetime: nextDay.getTime(),
        });

        notes[1] = NoteMetadata.applyPatch(notes[0], {
            createdDatetime: nextDay.getTime(),
        });

        store.dispatch(new GetNoteCollectionCompleteAction({ notes }));
        fixture.detectChanges();

        component.selectDateFilter(nextDay);
        fixture.detectChanges();

        const noteItemElList = fixture.debugElement.queryAll(By.directive(NoteItemComponent));

        expect(noteItemElList.length).toEqual(2);

        validateNoteItem(noteItemElList[0], notes[0]);
        validateNoteItem(noteItemElList[1], notes[1]);
    });

    it('should show selected date when select date filter.', () => {
        const selectedDate = datetime.today();
        datetime.add(selectedDate, DateUnits.DAY, 3);

        component.selectDateFilter(selectedDate);
        fixture.detectChanges();

        const selectedDateEl = fixture.debugElement.query(By.css('.NoteFinder__writtenAt > h2'));

        expect(selectedDateEl.nativeElement.innerText).toContain(
            datePipe.transform(selectedDate, 'MMM d'),
        );
    });

    it('should dispatch \'SELECT_NOTE\' action on click note item.', () => {
        const notes = createDummyList(new NoteMetadataDummyFactory(), 5);

        store.dispatch(new GetNoteCollectionCompleteAction({ notes }));
        fixture.detectChanges();

        const noteItemElList = fixture.debugElement.queryAll(By.directive(NoteItemComponent));
        const target = noteItemElList[2];

        target.triggerEventHandler('click', {});
        fixture.detectChanges();

        expect(store.dispatch).toHaveBeenCalledWith(new SelectNoteAction({
            selectedNote: notes[2],
        }));
    });

    it('should note item has been selected if note is selected.', () => {
        const notes = createDummyList(new NoteMetadataDummyFactory(), 10);

        store.dispatch(new GetNoteCollectionCompleteAction({ notes }));
        fixture.detectChanges();

        store.dispatch(new SelectNoteAction({ selectedNote: notes[6] }));
        fixture.detectChanges();

        const noteItemElList = fixture.debugElement.queryAll(By.directive(NoteItemComponent));
        const instance: NoteItemComponent = noteItemElList[6].componentInstance;

        expect(instance.selected).toBe(true);
    });

    it('should add new note when click add new note button.', () => {
        const notes = createDummyList(new NoteMetadataDummyFactory(), 5);

        store.dispatch(new GetNoteCollectionCompleteAction({ notes }));
        fixture.detectChanges();

        const addNewNoteButton = fixture.debugElement.query(
            By.css('.NoteFinder__addNoteButton'));

        addNewNoteButton.nativeElement.click();
        fixture.detectChanges();

        const noteItemElList = fixture.debugElement.queryAll(By.directive(NoteItemComponent));
        const newNoteItemEl = noteItemElList[0];
        const newNoteItemInstance: NoteItemComponent = newNoteItemEl.componentInstance;

        expect(newNoteItemInstance.note.title).toEqual('Untitled Note');
        expect(newNoteItemInstance.note.stacks).toEqual([]);
    });
});
