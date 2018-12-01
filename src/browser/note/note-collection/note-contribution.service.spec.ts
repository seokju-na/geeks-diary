import { CommonModule, DatePipe } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { fastTestSetup } from '../../../../test/helpers';
import { Contribution, ContributionMeasurement } from '../../../core/contribution';
import { noteReducerMap } from '../note.reducer';
import { NoteStateWithRoot } from '../note.state';
import { SelectMonthFilterAction } from './note-collection.actions';
import { NoteContributionTable } from './note-collection.state';
import { NOTE_CONTRIBUTION_MEASUREMENT, NoteContributionService } from './note-contribution.service';


class TestContributionMeasurement extends ContributionMeasurement<Date> {
    measure(keys: Date[], keyGenerator: (key: Date) => string): Contribution {
        return undefined;
    }
}


describe('browser.note.noteCollection.NoteContributionService', () => {
    let contributionService: NoteContributionService;

    let store: Store<NoteStateWithRoot>;
    let measurement: ContributionMeasurement<Date>;

    fastTestSetup();

    beforeAll(() => {
        TestBed.configureTestingModule({
            imports: [
                CommonModule,
                StoreModule.forRoot({
                    note: combineReducers(noteReducerMap),
                }),
            ],
            providers: [
                DatePipe,
                {
                    provide: NOTE_CONTRIBUTION_MEASUREMENT,
                    useClass: TestContributionMeasurement,
                },
                NoteContributionService,
            ],
        });
    });

    beforeEach(() => {
        contributionService = TestBed.get(NoteContributionService);
        store = TestBed.get(Store);
        measurement = TestBed.get(NOTE_CONTRIBUTION_MEASUREMENT);
    });

    describe('measure', () => {
        it('should call measurement with selected month dates and key generator.', async () => {
            const selectedMonth = new Date(2018, 10);
            store.dispatch(new SelectMonthFilterAction({ date: selectedMonth }));

            const contribution: Contribution = { items: {} };
            spyOn(measurement, 'measure').and.returnValue(Promise.resolve(contribution));

            await contributionService.measure();

            const [keys, keyGenerator] = (measurement.measure as jasmine.Spy).calls.mostRecent().args;

            // Check keys
            const firstDate = (keys as Date[])[0];
            const lastDate = (keys as Date[])[29];

            expect(firstDate.getFullYear()).toEqual(2018);
            expect(firstDate.getMonth()).toEqual(10);
            expect(firstDate.getDate()).toEqual(1);

            expect(lastDate.getFullYear()).toEqual(2018);
            expect(lastDate.getMonth()).toEqual(10);
            expect(lastDate.getDate()).toEqual(30);

            // Check key generator
            const novemberThird = new Date(2018, 10, 3);
            expect((keyGenerator as Function)(novemberThird)).toEqual('2018.11.03');
        });

        it('should return note contribution table.', async () => {
            const contribution: Contribution = { items: { '2018.11.03': 10 } as NoteContributionTable };
            spyOn(measurement, 'measure').and.returnValue(Promise.resolve(contribution));

            const noteContributionTable = await contributionService.measure();

            expect(noteContributionTable).toEqual({ '2018.11.03': 10 });
        });
    });
});
