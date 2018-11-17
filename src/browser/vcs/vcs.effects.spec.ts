import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action, combineReducers, StoreModule } from '@ngrx/store';
import { of, ReplaySubject, throwError } from 'rxjs';
import { createDummies, fastTestSetup } from '../../../test/helpers';
import { VcsFileChangeDummy } from './dummies';
import { UpdateFileChangesAction, UpdateFileChangesErrorAction } from './vcs.actions';
import { VCS_DETECT_CHANGES_EFFECT_ACTIONS, VCS_DETECT_CHANGES_THROTTLE_TIME, VcsEffects } from './vcs.effects';
import { vcsReducerMap } from './vcs.reducer';
import { VcsService } from './vcs.service';
import Spy = jasmine.Spy;


const testActions = {
    registeredAction1: {
        type: 'action1',
    } as Action,
    registeredAction2: {
        type: 'action2',
    } as Action,
    unregisteredAction: {
        type: 'unregisteredAction',
    } as Action,
};


describe('browser.vcs.VcsEffects', () => {
    let effects: VcsEffects;

    let actions: ReplaySubject<Action>;
    let vcsService: VcsService;

    const fileChangeDummy = new VcsFileChangeDummy();

    fastTestSetup();

    beforeAll(() => {
        actions = new ReplaySubject(1);
        vcsService = jasmine.createSpyObj('vcsService', [
            'fetchFileChanges',
        ]);

        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot({
                    vcs: combineReducers(vcsReducerMap),
                }),
            ],
            providers: [
                {
                    provide: VCS_DETECT_CHANGES_EFFECT_ACTIONS,
                    useValue: ['action1', 'action2'],
                },
                { provide: VcsService, useValue: vcsService },
                provideMockActions(() => actions),
                VcsEffects,
            ],
        });
    });

    beforeEach(() => {
        effects = TestBed.get(VcsEffects);
    });

    describe('detectChanges', () => {
        it('should not react when unregistered action dispatched.', fakeAsync(() => {
            const callback = jasmine.createSpy('callback');
            const subscription = effects.detectChanges.subscribe(callback);

            const fileChanges = createDummies(fileChangeDummy, 10);

            (vcsService.fetchFileChanges as Spy).and.returnValue(of(fileChanges));

            actions.next(testActions.unregisteredAction);
            tick(VCS_DETECT_CHANGES_THROTTLE_TIME);

            expect(callback).not.toHaveBeenCalledWith(new UpdateFileChangesAction({ fileChanges }));
            subscription.unsubscribe();
        }));

        it('should return \'UPDATE_FILE_CHANGES\' action after throttle time.', fakeAsync(() => {
            const callback = jasmine.createSpy('callback');
            const subscription = effects.detectChanges.subscribe(callback);

            const fileChanges = createDummies(fileChangeDummy, 10);

            (vcsService.fetchFileChanges as Spy).and.returnValue(of(fileChanges));

            actions.next(testActions.registeredAction1);
            tick(VCS_DETECT_CHANGES_THROTTLE_TIME);

            expect(callback).toHaveBeenCalledWith(new UpdateFileChangesAction({ fileChanges }));
            subscription.unsubscribe();
        }));

        it('should return \'UPDATE_FILE_CHANGES_FAIL\' action when error caught.', fakeAsync(() => {
            const callback = jasmine.createSpy('callback');
            const subscription = effects.detectChanges.subscribe(callback);

            (vcsService.fetchFileChanges as Spy).and.returnValue(throwError('Some Error'));

            actions.next(testActions.registeredAction2);
            tick(VCS_DETECT_CHANGES_THROTTLE_TIME);

            expect(callback).toHaveBeenCalledWith(new UpdateFileChangesErrorAction('Some Error'));
            subscription.unsubscribe();
        }));
    });
});
