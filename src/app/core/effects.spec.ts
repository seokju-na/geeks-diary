import { fakeAsync, flush, inject, TestBed } from '@angular/core/testing';
import { Actions } from '@ngrx/effects';
import { Subject } from 'rxjs/Subject';
import { MockActions, MockFsService } from '../../testing/mock';
import {
    LoadUserDataAction,
    LoadUserDataCompleteAction,
    UserDataActions,
} from './actions';
import { UserDataEffects } from './effects';
import { FsService } from './fs.service';
import { createInitialUserDataState, UserDataState } from './reducers';


describe('app.core.effects.UserDataEffects', () => {
    let userDataEffects: UserDataEffects;

    let mockFsService: MockFsService;
    let mockActions: MockActions;

    beforeEach(() => {
        TestBed
            .configureTestingModule({
                providers: [
                    UserDataEffects,
                    ...MockFsService.providersForTesting,
                    ...MockActions.providersForTesting,
                ],
            });
    });

    beforeEach(inject(
        [UserDataEffects, FsService, Actions],
        (u: UserDataEffects, f: MockFsService, a: MockActions) => {
            userDataEffects = u;
            mockFsService = f;
            mockActions = a;
        },
    ));

    describe('load', () => {
        it('should create user data file with initial user data state ' +
            'if data file is not exists.', fakeAsync(() => {

            const actions = new Subject<UserDataActions>();
            mockActions.stream = actions;

            const loadCallback = jasmine.createSpy('loadCallback');
            userDataEffects.load.subscribe(loadCallback);

            actions.next(new LoadUserDataAction());
            flush();

            mockFsService
                .expect({
                    methodName: 'access',
                    args: [userDataEffects.dataFileName],
                })
                .error({} as any);

            mockFsService
                .expect({
                    methodName: 'writeFile',
                    args: [
                        userDataEffects.dataFileName,
                        JSON.stringify(createInitialUserDataState()),
                        'utf8',
                    ],
                })
                .flush();

            expect(loadCallback).toHaveBeenCalledWith(new LoadUserDataCompleteAction({
                userData: createInitialUserDataState(),
            }));
        }));

        it('should dispatch user data payload which stored in user data file.', fakeAsync(() => {
            const actions = new Subject<UserDataActions>();
            mockActions.stream = actions;

            const loadCallback = jasmine.createSpy('loadCallback');
            userDataEffects.load.subscribe(loadCallback);

            actions.next(new LoadUserDataAction());
            flush();

            mockFsService
                .expect({
                    methodName: 'access',
                    args: [userDataEffects.dataFileName],
                })
                .flush();

            const userData: UserDataState = {
                lastOpenedNoteId: 'some cool note',
            };

            mockFsService
                .expect({
                    methodName: 'readFile',
                    args: [userDataEffects.dataFileName, 'utf8'],
                })
                .flush(Buffer.from(JSON.stringify(userData), 'utf8'));

            expect(loadCallback).toHaveBeenCalledWith(
                new LoadUserDataCompleteAction({ userData }));
        }));
    });
});
