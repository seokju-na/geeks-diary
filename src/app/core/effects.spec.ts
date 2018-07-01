import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action, Store, StoreModule } from '@ngrx/store';
import { of, Subject, throwError } from 'rxjs';
import { MockFsService } from '../../testing/mock';
import { AppState } from '../app-reducers';
import {
    LoadUserDataAction,
    LoadUserDataCompleteAction,
    SaveUserDataAction,
    SaveUserDataCompleteAction,
    SaveUserDataErrorAction,
} from './actions';
import { UserDataDummyFactory } from './dummies';
import { UserDataEffects } from './effects';
import { userDataReducer } from './reducers';
import { UserDataService } from './user-data.service';


describe('app.core.effects.UserDataEffects', () => {
    let userDataEffects: UserDataEffects;

    let userDataService: UserDataService;
    let store: Store<AppState>;

    let callback: jasmine.Spy;
    let actions: Subject<Action>;

    beforeEach(() => {
        actions = new Subject<Action>();
        callback = jasmine.createSpy('callback');
    });

    beforeEach(() => {
        TestBed
            .configureTestingModule({
                imports: [
                    StoreModule.forRoot({
                        userData: userDataReducer,
                    }),
                ],
                providers: [
                    ...MockFsService.providersForTesting,
                    provideMockActions(() => actions.asObservable()),
                    UserDataService,
                    UserDataEffects,
                ],
            });
    });

    beforeEach(() => {
        userDataEffects = TestBed.get(UserDataEffects);
        userDataService = TestBed.get(UserDataService);
        store = TestBed.get(Store);
    });

    describe('load', () => {
        it('should return new \'LOAD_COMPLETE\' action, ' +
            'with user data, on success.', fakeAsync(() => {

            const userData = new UserDataDummyFactory().create();
            spyOn(userDataService, 'readUserData').and.returnValue(of(userData));

            userDataEffects.load.subscribe(callback);
            actions.next(new LoadUserDataAction());
            flush();

            const expected = new LoadUserDataCompleteAction({ userData });
            expect(callback).toHaveBeenCalledWith(expected);
        }));
    });

    describe('save', () => {
        it('should return new \'SAVE_USER_DATA_COMPLETE\' action, ' +
            'and write user data at file, on success.', fakeAsync(() => {

            // Initialize states.
            const userData = new UserDataDummyFactory().create();
            store.dispatch(new LoadUserDataCompleteAction({ userData }));
            flush();

            spyOn(userDataService, 'writeUserData').and.returnValue(of(null));

            userDataEffects.save.subscribe(callback);
            actions.next(new SaveUserDataAction({ userData }));
            flush();

            expect(userDataService.writeUserData).toHaveBeenCalledWith(userData);
            expect(callback).toHaveBeenCalledWith(new SaveUserDataCompleteAction());
        }));

        it('should return new \'SSAVE_USER_DATA_ERROR\' action, on fail.', fakeAsync(() => {
            // Initialize states.
            const userData = new UserDataDummyFactory().create();
            store.dispatch(new LoadUserDataCompleteAction({ userData }));
            flush();

            const error = new Error('some error');
            spyOn(userDataService, 'writeUserData')
                .and.returnValue(throwError(error));

            userDataEffects.save.subscribe(callback);
            actions.next(new SaveUserDataAction({ userData }));
            flush();

            expect(userDataService.writeUserData).toHaveBeenCalledWith(userData);
            expect(callback).toHaveBeenCalledWith(new SaveUserDataErrorAction(error));
        }));
    });
});
