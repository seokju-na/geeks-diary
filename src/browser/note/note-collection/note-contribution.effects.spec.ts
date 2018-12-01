import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action, combineReducers, StoreModule } from '@ngrx/store';
import { ReplaySubject } from 'rxjs';
import { fastTestSetup } from '../../../../test/helpers';
import { noteReducerMap } from '../note.reducer';
import { UpdateNoteContributionAction, UpdateNoteContributionFailAction } from './note-collection.actions';
import {
    NOTE_CONTRIBUTION_UPDATED_EFFECT_ACTIONS,
    NOTE_CONTRIBUTION_UPDATED_THROTTLE_TIME,
    NoteContributionEffects,
} from './note-contribution.effects';
import { NoteContributionService } from './note-contribution.service';
import Spy = jasmine.Spy;


const testActions = {
    registeredAction: {
        type: 'registeredAction',
    } as Action,
    unregisteredAction: {
        type: 'unregisteredAction',
    } as Action,
};


describe('browser.note.noteCollection.NoteContributionEffects', () => {
    let effects: NoteContributionEffects;

    let actions: ReplaySubject<Action>;
    let contributionService: NoteContributionService;

    fastTestSetup();

    beforeAll(() => {
        actions = new ReplaySubject(1);
        contributionService = jasmine.createSpyObj('contributionService', [
            'measure',
        ]);

        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot({
                    note: combineReducers(noteReducerMap),
                }),
            ],
            providers: [
                {
                    provide: NOTE_CONTRIBUTION_UPDATED_EFFECT_ACTIONS,
                    useValue: ['registeredAction'],
                },
                provideMockActions(() => actions),
                { provide: NoteContributionService, useValue: contributionService },
                NoteContributionEffects,
            ],
        });
    });

    beforeEach(() => {
        effects = TestBed.get(NoteContributionEffects);
    });

    describe('contributionUpdated', () => {
        it('should not effect when unregistered action dispatched.', fakeAsync(() => {
            const callback = jasmine.createSpy('callback');
            const subscription = effects.contributionUpdated.subscribe(callback);

            (contributionService.measure as Spy).and.returnValue(Promise.resolve({}));

            actions.next(testActions.unregisteredAction);
            tick(NOTE_CONTRIBUTION_UPDATED_THROTTLE_TIME);

            expect(callback).not.toHaveBeenCalledWith(new UpdateNoteContributionAction({ contribution: {} }));
            subscription.unsubscribe();
        }));

        it('should return \'UPDATE_CONTRIBUTION\' action after throttle time.', fakeAsync(() => {
            const callback = jasmine.createSpy('callback');
            const subscription = effects.contributionUpdated.subscribe(callback);

            (contributionService.measure as Spy).and.returnValue(Promise.resolve({}));

            actions.next(testActions.registeredAction);
            tick(NOTE_CONTRIBUTION_UPDATED_THROTTLE_TIME);

            expect(callback).toHaveBeenCalledWith(new UpdateNoteContributionAction({ contribution: {} }));
            subscription.unsubscribe();
        }));

        it('should return \'UPDATE_CONTRIBUTION_FAIL\' action when error caught.', fakeAsync(() => {
            const callback = jasmine.createSpy('callback');
            const subscription = effects.contributionUpdated.subscribe(callback);

            (contributionService.measure as Spy).and.callFake(() => Promise.reject('Some Error'));

            actions.next(testActions.registeredAction);
            tick(NOTE_CONTRIBUTION_UPDATED_THROTTLE_TIME);

            expect(callback).toHaveBeenCalledWith(new UpdateNoteContributionFailAction('Some Error'));
            subscription.unsubscribe();
        }));
    });
});
